import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { FlatfileEvent } from '@flatfile/listener'
import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import axios from 'axios'
import { forwardWebhook } from '../src'

jest.mock('axios')

describe('forward-webhook() e2e', () => {
  let spaceId: string
  const listener = setupListener()

  const mockedAxiosPost = axios.post as jest.MockedFunction<typeof axios.post>

  beforeEach(async () => {
    const space = await setupSpace()
    spaceId = space.id
  })

  afterEach(async () => {
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
    mockedAxiosPost.mockResolvedValue({
      status: 200,
      data: {},
    })

    listener.use(
      forwardWebhook('https://example.com', (data, event) => {
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
        return expect(e).toBeTruthy(), expect(e.payload.error).toBeFalsy()
      }),
      expect.hasAssertions()
    )
  })

  it('should send data and receive a resolution', async () => {
    let testData

    const waitForWebhookCompletion = new Promise((resolve) => {
      listener.on('job:outcome-acknowledged', (e: FlatfileEvent) => {
        resolve(e)
      })
    })
    listener.use(
      forwardWebhook('https://example.com', (data, event) => {
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
    mockedAxiosPost.mockResolvedValue({
      status: 500,
      data: {},
    })
    let testData

    listener.use(
      forwardWebhook('https://example.com', (data, event) => {
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
