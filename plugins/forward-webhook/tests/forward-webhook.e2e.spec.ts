import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'

import { CrossEnvConfig } from '@flatfile/cross-env-config'
import { FlatfileEvent } from '@flatfile/listener'
import { forwardWebhook } from '../src'

const url = CrossEnvConfig.get('WEBHOOK_SITE_URL')
if (url === undefined || url === '')
  throw new Error('WEBHOOK_SITE_URL is undefined')
const dataUrl = `${url}/data/`
const errUrl = `http://badUrl.bad/error/`

describe('forward-webhook() e2e', () => {
  let spaceId: string
  const listener = setupListener()

  beforeEach(async () => {
    console.log('Setting up temporary Space and Retrieving spaceId')
    const space = await setupSpace()
    spaceId = space.id
  })

  afterEach(async () => {
    console.log('Deleting temporary Space')
    await deleteSpace(spaceId)
  })

  it('should forward webhook', async () => {
    console.log('setting up forwarding')
    let testData

    listener.use(forwardWebhook(url, (data) => (testData = data)))

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
    listener.use(forwardWebhook(dataUrl, (data) => (testData = data)))
    return (
      await waitForWebhookCompletion.then((e: FlatfileEvent) => {
        return expect(testData).toBeTruthy, expect(e.payload.error).toBeFalsy()
      }),
      expect.hasAssertions()
    )
  })

  it('should error on error received', async () => {
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
