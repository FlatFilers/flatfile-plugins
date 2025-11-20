import type { FlatfileEvent } from '@flatfile/listener'
import {
  createRecords,
  deleteSpace,
  setupDriver,
  setupSimpleWorkbook,
  setupSpace,
  TestListener,
} from '@flatfile/utils-testing'
import type fetch from 'cross-fetch'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest'
import { webhookEventForward } from '.'

// Only mock the webhook call, not all fetch calls
const mockWebhookFetch = vi.fn()

vi.mock('cross-fetch', async (importOriginal) => {
  const original = (await importOriginal()) as typeof import('cross-fetch')
  return {
    ...original,
    default: (...args: Parameters<typeof fetch>) => {
      // Only mock calls to the webhook URL, pass through other API calls
      if (args[0] === 'https://example.com') {
        return mockWebhookFetch(...args)
      }
      return original.default(...args)
    },
  }
})

describe('forward-webhook() e2e', () => {
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
    sheetId = workbook.sheets ? workbook.sheets[0].id : ''
  })

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  let callback: Mock
  beforeEach(async () => {
    listener.resetCount()

    vi.restoreAllMocks()
    mockWebhookFetch.mockClear()

    callback = vi.fn((data: unknown, event: FlatfileEvent) => {
      return { topic: event.topic, data }
    })
    listener.use(webhookEventForward('https://example.com', callback))
  })

  afterEach(() => {
    listener.reset()
  })

  it('should pass event', async () => {
    const mockResponse = {
      hello: 'Flatfile',
    }

    mockWebhookFetch.mockResolvedValue({
      status: 200,
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue(mockResponse),
      text: vi.fn().mockResolvedValue(''),
    } as unknown as Response)

    await createRecords(sheetId, [{ name: 'John' }])
    await listener.waitFor('commit:created')

    // Ensure webhook was called
    expect(mockWebhookFetch).toHaveBeenCalled()

    const callbackReturnValue = callback.mock.results.filter(
      (result) => result.value?.topic === 'commit:created'
    )
    expect(callbackReturnValue[0]?.value).toEqual(
      expect.objectContaining({
        topic: 'commit:created',
        data: mockResponse,
      })
    )
  })

  it('should error', async () => {
    mockWebhookFetch.mockResolvedValue({
      status: 500,
      statusText: 'Internal Server Error',
      ok: false,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({}),
      text: vi.fn().mockResolvedValue(''),
    } as unknown as Response)

    await createRecords(sheetId, [{ name: 'Jane' }])
    await listener.waitFor('commit:created')

    // Ensure webhook was called
    expect(mockWebhookFetch).toHaveBeenCalled()

    const callbackReturnValue = callback.mock.results.filter(
      (result) => result.value?.topic === 'commit:created'
    )
    expect(callbackReturnValue[0]?.value).toEqual(
      expect.objectContaining({
        topic: 'commit:created',
        data: {
          data: 'Error: Error forwarding webhook: 500 Internal Server Error',
          error: true,
          message: 'Error received, please try again',
        },
      })
    )
  })
})
