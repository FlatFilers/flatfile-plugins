import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  setupDriver,
  setupSimpleWorkbook,
  setupSpace,
  TestListener,
} from '@flatfile/utils-testing'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { webhookEgress } from './webhook.egress'

const api = new FlatfileClient()

describe('webhookEgress() e2e', () => {
  const listener = new TestListener()
  const driver = setupDriver()

  let spaceId: string
  let workbookId: string
  let sheetId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      'name',
      'email',
      'notes',
    ])
    workbookId = workbook.id
    const firstSheet = workbook.sheets?.[0]
    if (!firstSheet?.id) {
      throw new Error('Test setup failed: sheet ID not found')
    }
    sheetId = firstSheet.id
    await createRecords(sheetId, [
      {
        name: 'John Doe',
        email: 'john@doe.com',
        notes: 'foobar',
      },
      {
        name: 'Jane Doe',
        email: 'jane@doe.com',
        notes: 'foobar',
      },
    ])
  })

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()

    vi.restoreAllMocks()
  })

  afterEach(() => {
    listener.reset()
  })

  it('returns successful outcome message', async () => {
    const MOCK_WEBHOOK_URL = 'example.com'
    const originalFetch = global.fetch
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      let urlString: string
      if (typeof input === 'string') {
        urlString = input
      } else if (input instanceof Request) {
        urlString = input.url
      } else {
        urlString = input.href // input is URL
      }

      if (urlString === MOCK_WEBHOOK_URL) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: {} }), { status: 200 })
        )
      }
      return originalFetch(input, init)
    })

    listener.use(webhookEgress('workbook:egressTestSuccess', MOCK_WEBHOOK_URL))

    const { data: successfulJob } = await api.jobs.create({
      type: 'workbook',
      operation: 'egressTestSuccess',
      source: workbookId,
    })
    const successfulJobId = successfulJob.id
    await api.jobs.execute(successfulJobId)

    await listener.waitFor('job:ready', 1, 'workbook:egressTestSuccess')

    const response = await api.jobs.get(successfulJobId)
    expect(response.data.outcome?.message).toEqual(
      'Data was successfully submitted to the provided webhook. Go check it out at example.com.'
    )
  })

  it('returns failure outcome message', async () => {
    const MOCK_WEBHOOK_URL = 'example.com'
    const originalFetch = global.fetch
    vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      let urlString: string
      if (typeof input === 'string') {
        urlString = input
      } else if (input instanceof Request) {
        urlString = input.url
      } else {
        urlString = input.href // input is URL
      }

      if (urlString === MOCK_WEBHOOK_URL) {
        return Promise.resolve(
          new Response(JSON.stringify({ data: {} }), {
            status: 400,
            statusText: 'Bad Request',
          })
        )
      }
      return originalFetch(input, init)
    })

    const logErrorSpy = vi.spyOn(global.console, 'error')
    logErrorSpy.mockImplementation((message) => {
      if (
        message.includes(
          'Data was not successfully submitted to the provided webhook. Status: 400 Bad Request'
        )
      ) {
        console.error(message)
      }
    })
    listener.use(webhookEgress('workbook:egressTestFailure', MOCK_WEBHOOK_URL))

    const { data: failedJob } = await api.jobs.create({
      type: 'workbook',
      operation: 'egressTestFailure',
      source: workbookId,
    })
    const failedJobId = failedJob.id
    await api.jobs.execute(failedJobId)

    await listener.waitFor('job:ready', 1, 'workbook:egressTestFailure')

    expect(logErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[@flatfile/plugin-webhook-egress]:[FATAL] Failed to submit data to example.com. Status: 400 Bad Request'
      )
    )

    const response = await api.jobs.get(failedJobId)
    expect(response.data.outcome).toEqual(
      expect.objectContaining({
        message:
          'Data was not successfully submitted to the provided webhook. Status: 400 Bad Request',
      })
    )
  })

  describe('webhookEgress() e2e w/ response rejection', () => {
    it('returns no rejections', async () => {
      const MOCK_WEBHOOK_URL = 'example.com'
      const originalFetch = global.fetch
      vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
        let urlString: string
        if (typeof input === 'string') {
          urlString = input
        } else if (input instanceof Request) {
          urlString = input.url
        } else {
          urlString = input.href // input is URL
        }

        if (urlString === MOCK_WEBHOOK_URL) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                rejections: {
                  deleteSubmitted: true,
                },
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
          )
        }
        return originalFetch(input, init)
      })
      listener.use(
        webhookEgress('workbook:egressTestSuccess', MOCK_WEBHOOK_URL)
      )

      const { data: successfulJob } = await api.jobs.create({
        type: 'workbook',
        operation: 'egressTestSuccess',
        source: workbookId,
      })
      const successfulJobId = successfulJob.id
      await api.jobs.execute(successfulJobId)

      await listener.waitFor('job:ready', 1, 'workbook:egressTestSuccess')

      const response = await api.jobs.get(successfulJobId)
      expect(response.data.outcome?.message).toEqual(
        'The data has been successfully submitted without any rejections. This task is now complete.'
      )
      expect(response.data.outcome?.heading).toEqual('Success!')
    })

    it('returns rejections', async () => {
      const MOCK_WEBHOOK_URL = 'example.com'
      const originalFetch = global.fetch
      vi.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
        let urlString: string
        if (typeof input === 'string') {
          urlString = input
        } else if (input instanceof Request) {
          urlString = input.url
        } else {
          urlString = input.href // input is URL
        }

        if (urlString === MOCK_WEBHOOK_URL) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                rejections: {
                  id: workbookId,
                  deleteSubmitted: true,
                  sheets: [
                    {
                      sheetId: sheetId,
                      rejectedRecords: [
                        {
                          id: 'dev_rc_91d271c823d84a378ec0165ddc886864',
                          values: [
                            {
                              field: 'email',
                              message: 'Not a valid Flatfile email address',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
          )
        }
        return originalFetch(input, init)
      })
      listener.use(
        webhookEgress('workbook:egressTestSuccess', MOCK_WEBHOOK_URL)
      )

      const { data: successfulJob } = await api.jobs.create({
        type: 'workbook',
        operation: 'egressTestSuccess',
        source: workbookId,
      })
      const successfulJobId = successfulJob.id
      await api.jobs.execute(successfulJobId)

      await listener.waitFor('job:ready', 1, 'workbook:egressTestSuccess')

      const response = await api.jobs.get(successfulJobId)
      expect(response.data.outcome?.message).toEqual(
        'During the data submission process, 1 records were rejected. Please review and correct these records before resubmitting.'
      )
      expect(response.data.outcome?.heading).toEqual('Rejected Records')
    })
  })
})
