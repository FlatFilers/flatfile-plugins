import {
  deleteSpace,
  setupListener,
  setupSpace,
  startServer,
  stopServer,
} from '@flatfile/utils-testing'

import { FlatfileEvent } from '@flatfile/listener'
import axios from 'axios'
import express from 'express'
import http from 'http'
import { forwardWebhook } from '../src'

const app = express()
const port = 6060
const url = `http://localhost:${port}/`
const dataUrl = `http://localhost:${port}/data/`
const errUrl = `http://localhost:${port}/error/`

describe('forward-webhook() e2e', () => {
  let server: http.Server
  let spaceId: string
  const listener = setupListener()

  beforeEach(async () => {
    console.log(`Starting temporary server on port ${port}`)
    server = startServer(app, port, { message: 'Hello World!' })

    console.log('Setting up temporary Space and Retrieving spaceId')
    const space = await setupSpace()
    spaceId = space.id
  })

  afterEach(async () => {
    console.log(`Stopping temporary server on port ${port}`)
    try {
      await stopServer(server)
    } catch (e) {
      console.error(e)
    }

    console.log('Deleting temporary Space')
    await deleteSpace(spaceId)
  })

  it('should have spun up the server properly', async () => {
    console.log('testing server')
    const { data } = await axios.get(url)
    console.dir(data)

    const dataTwo = await axios
      .post(
        url,
        { message: 'Hello World!' },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-request-id': '13242',
          },
        }
      )
      .catch((err) => {
        console.error(err)
      })
    console.dir(dataTwo)

    return expect(data).toBeTruthy, expect(dataTwo).toBeTruthy()
  })

  it('should forward webhook', async () => {
    console.log('setting up forwarding')
    let testData

    listener.use(forwardWebhook(url, (data) => (testData = data)))

    const waitForWebhookCompletion = new Promise((resolve) => {
      listener.on('job:outcome-acknowledged', (e: FlatfileEvent) => {
        console.log('webhook complete')
        resolve(e)
      })
    })

    return (
      await waitForWebhookCompletion.then((e: FlatfileEvent) => {
        return expect(e).toBeTruthy(), expect(e.payload.error).toBeFalsy()
      }),
      expect.hasAssertions()
    )
  })

  it('should send data and receive a resolution', async () => {
    console.log('setting up forwarding with data')
    let testData

    const waitForWebhookCompletion = new Promise((resolve) => {
      listener.on('job:outcome-acknowledged', (e: FlatfileEvent) => {
        console.log('webhook complete')
        resolve(e)
      })
    })
    listener.use(forwardWebhook(dataUrl, (data) => (testData = data)))
    return (
      await waitForWebhookCompletion.then((e: FlatfileEvent) => {
        return (
          expect(testData.data.dataMessage).toBe('Hello World!'),
          expect(e.payload.error).toBeFalsy()
        )
      }),
      expect.hasAssertions()
    )
  })

  it('should error on 500 received', async () => {
    console.log('setting up forwarding for error')
    let testData

    listener.use(
      forwardWebhook(errUrl, (data) => {
        // callbacks do not run on error
        testData = data
      })
    )
    const waitForWebhookCompletion = new Promise((resolve) => {
      listener.on('job:outcome-acknowledged', (e: FlatfileEvent) => {
        console.log('webhook complete')
        resolve(e)
      })
    })
    return (
      await waitForWebhookCompletion.then((e: FlatfileEvent) => {
        return (
          expect(e.payload.error).toBe(true), expect(testData).toBeUndefined()
        )
      }),
      expect.hasAssertions()
    )
  })
})
