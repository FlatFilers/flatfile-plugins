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

jest.setTimeout(10_000)

describe('bulkRecordHook() assigns an invalid value and adds an error e2e', () => {
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

  it('correctly assigns null and adds error', async () => {
    listener.use(
      bulkRecordHook('test', (records) =>
        records.map((record) => {
          record.set('name', null)
          if (record.get('name') === null) {
            record.addError('name', 'Name is null')
          }
        })
      )
    )
    await createRecords(sheetId, defaultSimpleValueData)

    await listener.waitFor('commit:created')
    const records = await getRecords(sheetId)

    const errors = records.map((r) => {
      const messages = r.values['name'].messages
      if (!messages) return []
      const errorMessages = messages.filter((m) => m.type === 'error')
      return errorMessages
    })
    errors.forEach((e, i) => (e.length === 0 ? errors[i].splice(i, 1) : null))

    expect(records[0].values['name']).toMatchObject({
      value: undefined,
    })
    expect(records[1].values['name']).toMatchObject({
      value: undefined,
    })

    expect(errors.length).toBe(records.length)
  }, 15_000)
})
