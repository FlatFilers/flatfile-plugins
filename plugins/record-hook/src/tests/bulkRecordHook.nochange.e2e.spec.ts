import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { bulkRecordHook } from '../record.hook.plugin'
import {
  defaultSimpleValueData,
  defaultSimpleValueSchema,
} from './simpleTestData'

describe('bulkRecordHook() no data change e2e', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

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

  it('console logs: No records modified', async () => {
    listener.use(
      bulkRecordHook(
        'test',
        (records) =>
          records.map((record) => {
            return
          }),
        { debug: true }
      )
    )
    await createRecords(sheetId, defaultSimpleValueData)

    const logSpy = jest.spyOn(global.console, 'log')
    await listener.waitFor('commit:created')
    expect(logSpy).toHaveBeenCalledWith('No records modified')
  }, 15_000)
})
