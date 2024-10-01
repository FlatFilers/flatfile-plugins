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
        'at least 2 characters'
      )
      expect(records[1].valid).toBeTruthy()
      expect(records[2].valid).toBeFalsy()
      expect(records[2].values['name']?.messages?.[0]?.message).toContain(
        'at most 10 characters'
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
        'match the required pattern'
      )
      expect(records[1].valid).toBeTruthy()
      expect(records[2].valid).toBeTruthy()
    })

    it('validates custom function', async () => {
      listener.use(
        validateString({
          sheetSlug: 'test',
          fields: ['code'],
          customTransform: (value) => {
            if (!/^[A-Z]{3}-\d{3}$/.test(value)) {
              return 'Code must be in the format XXX-000'
            }
            return value
          },
        })
      )

      await createRecords(sheetId, [
        { code: 'ABC-123' },
        { code: 'DEF-456' },
        { code: 'invalid' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeTruthy()
      expect(records[1].valid).toBeTruthy()
      expect(records[2].valid).toBeFalsy()
      expect(records[2].values['code'].messages?.[0].message).toBe(
        'Code must be in the format XXX-000'
      )
    })

    it('handles multiple validation rules', async () => {
      listener.use(
        validateString({
          sheetSlug: 'test',
          fields: ['name'],
          minLength: 3,
          maxLength: 20,
          pattern: /^[A-Za-z\s]+$/,
          customTransform: (value) => {
            if (value.split(' ').length < 2) {
              return 'Name must include both first and last name'
            }
            return value
          },
        })
      )

      await createRecords(sheetId, [
        { name: 'John Doe' },
        { name: 'A' },
        { name: 'OnlyFirstName' },
        { name: 'Contains123Numbers' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].valid).toBeTruthy()
      expect(records[1].valid).toBeFalsy()
      expect(records[1].values['name'].messages?.length).toBe(2) // minLength and customValidation
      expect(records[2].valid).toBeFalsy()
      expect(records[2].values['name'].messages?.[0].message).toContain(
        'both first and last name'
      )
      expect(records[3].valid).toBeFalsy()
      expect(records[3].values['name'].messages?.[0].message).toContain(
        'match the required pattern'
      )
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
