import type { Flatfile } from '@flatfile/api'
import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import axios from 'axios'

import api from '@flatfile/api'

import { CrossEnvConfig } from '@flatfile/cross-env-config'
import { FlatfileEvent } from '@flatfile/listener'
import { forwardWebhook } from '../src'

jest.mock('axios')

// const url = CrossEnvConfig.get('WEBHOOK_SITE_URL')
const url = 'https://example.com'
// if (url === undefined || url === '')
//   throw new Error('WEBHOOK_SITE_URL is undefined')
const dataUrl = `${url}/data/`
const errUrl = `http://badUrl.bad/error/`

describe('forward-webhook() e2e', () => {
  let spaceId: string
  const listener = setupListener()

  const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>

  beforeEach(async () => {
    console.log('Setting up temporary Space and Retrieving spaceId')
    const space = await setupSpace()
    spaceId = space.id
  })

  afterEach(async () => {
    console.log('Deleting temporary Space')
    await deleteSpace(spaceId)
  })

  it('should mock axios', async () => {
    mockedAxiosPost.mockResolvedValue({
      status: 200,
      data: {},
    })
    const data = await axios.post('https://example.com', { test: true })
    expect(data.status).toBe(200)
  })

  it('should forward webhook', async () => {
    console.log('setting up forwarding')
    let testData

    mockedAxiosPost.mockResolvedValue({
      status: 200,
      data: {},
    })

    listener.use(
      forwardWebhook(url, (data, event) => {
        if (event.topic === 'job:outcome-acknowledged') {
          return
        }
        console.dir(data, { depth: null })
        console.dir(event, { depth: null })
        api.events.create({
          domain: event.domain as Flatfile.Domain,
          topic: 'job:outcome-acknowledged',
          context: {
            ...event.context,
            actionName: 'forward-webhook',
          },
          payload: data,
        })
      })
    )

    const waitForWebhookCompletion = new Promise((resolve) => {
      listener.on('job:outcome-acknowledged', (e: FlatfileEvent) => {
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
        resolve(e)
      })
    })
    listener.use(
      forwardWebhook(url, (data, event) => {
        if (event.topic === 'job:outcome-acknowledged') {
          return
        }
        api.events.create({
          domain: event.domain as Flatfile.Domain,
          topic: 'job:outcome-acknowledged',
          context: {
            ...event.context,
            actionName: 'forward-webhook',
          },
          payload: data,
        })
      })
    )
    return (
      await waitForWebhookCompletion.then((e: FlatfileEvent) => {
        return expect(testData).toBeTruthy, expect(e.payload.error).toBeFalsy()
      }),
      expect.hasAssertions()
    )
  })

  it('should error on error received', async () => {
    console.log('setting up forwarding for error')
    mockedAxiosPost.mockResolvedValue({
      status: 500,
      data: {},
    })
    let testData

    listener.use(
      forwardWebhook(errUrl, (data, event) => {
        if (event.topic === 'job:outcome-acknowledged') {
          return
        }
        api.events.create({
          domain: event.domain as Flatfile.Domain,
          topic: 'job:outcome-acknowledged',
          context: {
            ...event.context,
            actionName: 'forward-webhook',
          },
          payload: data,
        })
      })
    )
    const waitForWebhookCompletion = new Promise((resolve) => {
      listener.on('job:outcome-acknowledged', (e: FlatfileEvent) => {
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
