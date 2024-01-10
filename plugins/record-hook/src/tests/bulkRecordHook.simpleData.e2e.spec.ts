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

const stringValue = 'bulk'
const intValue = 27
const booleanValue = false

jest.setTimeout(10_000)

describe.each([
  bulkRecordHook('test', (records) =>
    records.map((record) => {
      record.set('name', stringValue)
      record.set('age', intValue)
      record.set('alive', booleanValue)
    })
  ),
  bulkRecordHook(
    'test',
    async (records) =>
      await Promise.all(
        records.map((record) => {
          record.set('name', stringValue)
          record.set('age', intValue)
          record.set('alive', booleanValue)
        })
      )
  ),
])('bulkRecordHook() simple data modification e2e', (fn) => {
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

  beforeEach(async () => {
    listener.use(fn)
  })

  it('correctly modifies simple values', async () => {
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created')
    const records = await getRecords(sheetId)

    expect(records[0].values['name']).toMatchObject({ value: stringValue })
    expect(records[1].values['name']).toMatchObject({ value: stringValue })

    expect(records[0].values['age']).toMatchObject({ value: intValue })
    expect(records[1].values['age']).toMatchObject({ value: intValue })

    expect(records[0].values['alive']).toMatchObject({ value: booleanValue })
    expect(records[1].values['alive']).toMatchObject({ value: booleanValue })
  })
})
