import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { recordHook } from '../record.hook.plugin'
import {
  defaultObjectValueData,
  defaultObjectValueSchema,
} from './objectTestData'

jest.setTimeout(10_000)

const enumValue = 'secondValue'
const badEnumValue = 'badValue'

describe('recordHook() object data modification e2e', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(
      space.id,
      defaultObjectValueSchema
    )
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  describe('Assigns a valid value to an enum', () => {
    beforeEach(async () => {
      listener.use(
        recordHook('test', (record) => {
          record.set('array', enumValue)
        })
      )
    })

    it('correctly modifies Object values', async () => {
      await createRecords(sheetId, defaultObjectValueData)

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeTruthy()
    })
  })

  describe('Assigns an invalid value to an enum', () => {
    beforeEach(async () => {
      listener.use(
        recordHook('test', (record) => {
          record.set('array', badEnumValue)
        })
      )
    })

    it('correctly modifies Object values', async () => {
      await createRecords(sheetId, defaultObjectValueData)

      await listener.waitFor('commit:created')
      const records = await getRecords(sheetId)

      expect(records[1].valid).toBeFalsy()
    })
  })
})
