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

describe('bulkRecordHook() simple data modification e2e', () => {
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

  describe('Assigns metadata without assigning a new value', () => {
    it('correctly assigns metadata', async () => {
      listener.use(
        bulkRecordHook('test', (records) =>
          records.map((record) => {
            record.setMetadata({ test: true })
          })
        )
      )
      await createRecords(sheetId, defaultSimpleValueData)

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)

      expect(records[0].metadata).toMatchObject({ test: true })
      expect(records[1].metadata).toMatchObject({ test: true })
    }, 15_000)
  })
})
