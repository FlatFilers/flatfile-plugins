import api from '@flatfile/api'
import {
  deleteSpace,
  setupListener,
  setupSpace,
  startServer,
  stopServer,
} from '@flatfile/utils-testing'

import { FlatfileEvent } from '@flatfile/listener'
import exp from 'constants'
import express from 'express'
import { forwardWebhook } from '../src'

const app = express()
const port = 8080
const url = `http://localhost:${port}/`
const dataUrl = `http://localhost:${port}/data`
const errUrl = `http://localhost:${port}/error`

let server

describe('forward-webhook() e2e', () => {
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
    stopServer(server)

    console.log('Deleting temporary Space')
    await deleteSpace(spaceId)
  })

  /* The code block you provided is a test case that verifies the functionality of the `forwardWebhook`
function. */

  it('should forward webhook', async () => {
    console.log('setting up forwarding')
    let testData

    listener.use(forwardWebhook(url, (data) => (testData = data)))
    listener.on('job:outcome-acknowledged', (e: unknown) => {
      console.log('webhook complete')
    })
    const waitForWebhookCompletion = new Promise((resolve) => {
      listener.on('job:outcome-acknowledged', (e: FlatfileEvent) => {
        console.log('webhook complete')
        resolve(e)
      })
    })

    await waitForWebhookCompletion.then((e) => {
      return expect(e).toBeTruthy()
    })
    expect.hasAssertions()
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
    await waitForWebhookCompletion.then((e) => {
      expect(testData.data.dataMessage).toBe('Hello World!')
    })
    expect.hasAssertions()
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
    await waitForWebhookCompletion.then((e: FlatfileEvent) => {
      expect(e.payload.error).toBe(true)
      expect(testData).toBeUndefined()
    })
    expect.hasAssertions()
  })
})
