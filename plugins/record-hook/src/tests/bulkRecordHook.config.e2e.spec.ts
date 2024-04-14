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
  })
  beforeEach(async () => {
    const workbook = await setupSimpleWorkbook(
      spaceId,
      defaultSimpleValueSchema
    )
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  it('correctly assigns config for record', async () => {
    listener.use(
      bulkRecordHook('test', (records) =>
        records.map((record) => {
          record.setReadOnly()
        })
      )
    )
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created')
    const records = await getRecords(sheetId)

    expect(records[0].config).toMatchObject({ readonly: true })
    expect(records[1].config).toMatchObject({ readonly: true })
  }, 15_000)

  it('correctly assigns config for specific cell', async () => {
    listener.use(
      bulkRecordHook('test', (records) =>
        records.map((record) => {
          record.setReadOnly('age', 'name')
        })
      )
    )
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created')
    const records = await getRecords(sheetId)

    expect(records[0].config.fields.name.readonly).toEqual(true)
    expect(records[0].config.fields.age.readonly).toEqual(true)
    expect(records[1].config.fields.name.readonly).toEqual(true)
    expect(records[1].config.fields.age.readonly).toEqual(true)
  }, 15_000)
})
