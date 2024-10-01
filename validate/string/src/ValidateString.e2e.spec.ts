import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { validateString } from './index'

const api = new FlatfileClient()

describe('ValidateString e2e', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'name', type: 'string' },
      { key: 'email', type: 'string' },
      { key: 'code', type: 'string' },
    ])
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  afterEach(async () => {
    listener.reset()
    const records = await getRecords(sheetId)
    if (records.length > 0) {
      const ids = records.map((record) => record.id)
      await api.records.delete(sheetId, { ids })
    }
  })

  describe('validateString()', () => {
    it('validates string length', async () => {
      listener.use(
        validateString({
          sheetSlug: 'test',
          fields: ['name'],
          minLength: 2,
          maxLength: 10,
        })
      )

      await createRecords(sheetId, [
        { name: 'A' },
        { name: 'Valid' },
        { name: 'TooLongString' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeFalsy()
      expect(records[0].values['name']?.messages?.[0]?.message).toContain(
        'Minimum length is 2'
      )
      expect(records[1].valid).toBeTruthy()
      expect(records[2].valid).toBeFalsy()
      expect(records[2].values['name']?.messages?.[0]?.message).toContain(
        'Maximum length is 10'
      )
    })

    it('validates string pattern', async () => {
      listener.use(
        validateString({
          sheetSlug: 'test',
          fields: ['email'],
          pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        })
      )

      await createRecords(sheetId, [
        { email: 'invalid' },
        { email: 'valid@example.com' },
        { email: 'another.valid@email.co.uk' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeFalsy()
      expect(records[0].values['email'].messages?.[0].message).toContain(
        'Invalid format'
      )
      expect(records[1].valid).toBeTruthy()
      expect(records[2].valid).toBeTruthy()
    })

    it('handles empty strings correctly', async () => {
      listener.use(
        validateString({
          sheetSlug: 'test',
          fields: ['name'],
          minLength: 1,
          emptyStringAllowed: true,
        })
      )

      await createRecords(sheetId, [{ name: '' }, { name: 'Valid' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeTruthy()
      expect(records[1].valid).toBeTruthy()
    })
  })
})
