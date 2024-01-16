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

const messageValue = 'this is a name'

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

  describe('Assigns messages without assigning a new value', () => {
    it('correctly assigns messages', async () => {
      listener.use(
        bulkRecordHook('test', (records) =>
          records.map((record) => {
            record.addInfo('name', messageValue)
          })
        )
      )
      await createRecords(sheetId, defaultSimpleValueData)

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)
      // console.dir(records, { depth: null })
      expect(records[0].values['name'].messages[0]).toMatchObject({
        type: 'info',
        message: messageValue,
      })
      expect(records[1].values['name'].messages[0]).toMatchObject({
        type: 'info',
        message: messageValue,
      })
    })
  })
})
