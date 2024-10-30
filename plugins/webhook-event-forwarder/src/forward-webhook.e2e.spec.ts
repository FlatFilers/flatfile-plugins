import type { FlatfileEvent } from '@flatfile/listener'
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
import { webhookEventForward } from '.'

describe('forward-webhook() e2e', () => {
  const listener = new TestListener()
  const driver = setupDriver()

  let spaceId
  let workbookId
  let sheetId

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
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  let callback
  beforeEach(async () => {
    listener.resetCount()

    vi.restoreAllMocks()

    callback = vi.fn((data: any, event: FlatfileEvent) => {
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
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue(mockResponse),
    })

    await createRecords(sheetId, [{ name: 'John' }])
    await listener.waitFor('commit:created')

    const callbackReturnValue = callback.mock.results.filter(
      (result) => result.value.topic === 'commit:created'
    )
    expect(callbackReturnValue[0].value).toEqual(
      expect.objectContaining({
        topic: 'commit:created',
        data: mockResponse,
      })
    )
  })

  it('should error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 500,
      headers: {
        get: vi.fn().mockReturnValue('application/json'),
      },
      json: vi.fn().mockResolvedValue({}),
    })

    await createRecords(sheetId, [{ name: 'Jane' }])
    await listener.waitFor('commit:created')

    const callbackReturnValue = callback.mock.results.filter(
      (result) => result.value.topic === 'commit:created'
    )
    expect(callbackReturnValue[0].value).toEqual(
      expect.objectContaining({
        topic: 'commit:created',
        data: {
          data: 'Error: Error forwarding webhook',
          error: true,
          message: 'Error received, please try again',
        },
      })
    )
  })
})
