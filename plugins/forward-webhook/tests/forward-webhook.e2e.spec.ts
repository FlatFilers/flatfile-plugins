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

let server

describe('forward-webhook() e2e', () => {
  let spaceId: string
  const listener = setupListener()

  let testData

  beforeAll(async () => {
    console.log(`Starting temporary server on port ${port}`)
    server = startServer(app, port, { message: 'Hello World!' })

    console.log('setting up forwarding')
    listener.use(forwardWebhook(url, (data) => (testData = data)))

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

  it('should forward webhook', async () => {
    // listener.on('**', (e) => console.dir(e, { depth: null }))
    console.log('starting webhook')
    await listener.waitFor('job:outcome-acknowledged', 1)
    console.log('webhook complete')
    console.dir(testData, { depth: null })
    expect(true).toBe(true)
  })
})
