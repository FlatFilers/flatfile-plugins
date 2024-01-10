import {
  createRecords,
  deleteSpace,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { recordHook } from '../record.hook.plugin'
import { defaultSimpleValueSchema } from './simpleTestData'

describe('recordHook() throw error e2e', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string
  let logErrorSpy: jest.SpyInstance

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(
      space.id,
      defaultSimpleValueSchema
    )
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  beforeEach(async () => {
    logErrorSpy = jest.spyOn(global.console, 'error')
    listener.use(
      recordHook('test', (record) => {
        throw new Error('oops')
      })
    )
    await createRecords(sheetId, [
      {
        name: 'John Doe',
        email: 'john@doe.com',
        notes: 'foobar',
      },
    ])
  })

  afterEach(() => {
    logErrorSpy.mockClear()
  })

  it('returns readable error', async () => {
    await listener.waitFor('commit:created')
    expect(logErrorSpy).toHaveBeenCalledWith(
      'An error occurred while running the handler: oops'
    )
  }, 10_000)
})
