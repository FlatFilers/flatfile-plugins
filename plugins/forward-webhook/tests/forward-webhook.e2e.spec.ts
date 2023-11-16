import api from '@flatfile/api'
import {
  deleteSpace,
  setupListener,
  setupSpace,
  startServer,
  stopServer,
} from '@flatfile/utils-testing'

import express from 'express'
import { forwardWebhook } from '../src'

const app = express()
const port = 8080
const url = `http://localhost:${port}/`
const errUrl = `http://localhost:${port}/error`

let server

describe('forward-webhook() e2e', () => {
  let spaceId: string
  const listener = setupListener()

  let testData

  beforeAll(async () => {
    console.log(`Starting temporary server on port ${port}`)
    server = startServer(app, port, { message: 'Hello World!' })

    console.log('Setting up temporary Space and Retrieving spaceId')
    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    console.log(`Stopping temporary server on port ${port}`)
    stopServer(server)

    console.log('Deleting temporary Space')
    await deleteSpace(spaceId)
  })

  /* The code block you provided is a test case that verifies the functionality of the `forwardWebhook`
function. */
  it('should forward webhook', async () => {
    // console.log('starting webhook')
    console.log('setting up forwarding')
    listener.use(forwardWebhook(url, (data) => (testData = data)))
    listener.on('job:outcome-acknowledged', (e: unknown) => {
      console.log('webhook complete')
      expect(e).toBeTruthy()
    })
  })

  it('should error on 500 received', async () => {
    console.log('setting up forwarding')
    listener.use(forwardWebhook(errUrl, (data) => (testData = data)))
    listener.on('job:outcome-acknowledged', (e) => {
      console.log('webhook complete')
      expect(e.payload.error).toBe(true)
    })
  })
})
