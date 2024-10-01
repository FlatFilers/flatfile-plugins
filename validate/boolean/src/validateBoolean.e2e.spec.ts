import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { validateBoolean } from './index'

const api = new FlatfileClient()

describe('validateBoolean e2e', () => {
  const listener = setupListener()

  // Console spies
  const logSpy = jest.spyOn(global.console, 'log')
  const logErrorSpy = jest.spyOn(global.console, 'error')

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'isActive', type: 'boolean' },
      { key: 'hasSubscription', type: 'boolean' },
      { key: 'agreeToTerms', type: 'boolean' },
      { key: 'optIn', type: 'boolean' },
    ])
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  afterEach(async () => {
    listener.reset()
    logSpy.mockReset()
    logErrorSpy.mockReset()
    const records = await getRecords(sheetId)
    if (records.length > 0) {
      const ids = records.map((record) => record.id)
      await api.records.delete(sheetId, { ids })
    }
  })

  describe('validateBoolean()', () => {
    it('validates strict boolean values', async () => {
      listener.use(
        validateBoolean({
          fields: ['isActive'],
          validationType: 'strict'
        })
      )

      await createRecords(sheetId, [
        { isActive: true },
        { isActive: false },
        { isActive: 'true' },
        { isActive: 'false' },
        { isActive: 1 },
        { isActive: 0 },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)
      
      expect(records[0].values['isActive'].value).toBe(true)
      expect(records[1].values['isActive'].value).toBe(false)
      expect(records[2].values['isActive'].value).toBe(true)
      expect(records[3].values['isActive'].value).toBe(false)
      expect(records[4].values['isActive'].messages[0].message).toContain('Invalid boolean value')
      expect(records[5].values['isActive'].messages[0].message).toContain('Invalid boolean value')

    })

    it('validates truthy boolean values', async () => {
      listener.use(
        validateBoolean({
          fields: ['hasSubscription'],
          validationType: 'truthy',
        })
      )

      await createRecords(sheetId, [
        { hasSubscription: true },
        { hasSubscription: false },
        { hasSubscription: 'true' },
        { hasSubscription: 'false' },
        { hasSubscription: 1 },
        { hasSubscription: 0 },
        { hasSubscription: 'yes' },
        { hasSubscription: 'no' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['hasSubscription'].value).toBeTruthy()
      expect(records[1].values['hasSubscription'].value).toBeFalsy()
      expect(records[2].values['hasSubscription'].value).toBeTruthy()
      expect(records[3].values['hasSubscription'].value).toBeFalsy()
      expect(records[4].values['hasSubscription'].value).toBeTruthy()
      expect(records[5].values['hasSubscription'].value).toBeFalsy()
      expect(records[6].values['hasSubscription'].value).toBeTruthy()
      expect(records[7].values['hasSubscription'].value).toBeFalsy()
    })

    it('handles custom mapping', async () => {
      listener.use(
        validateBoolean({
          fields: ['agreeToTerms'],
          validationType: 'truthy',
          customMapping: { 'agreed': true, 'disagreed': false },
        })
      )

      await createRecords(sheetId, [
        { agreeToTerms: 'agreed' },
        { agreeToTerms: 'disagreed' },
        { agreeToTerms: 'yes' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['agreeToTerms'].value).toBeTruthy()
      expect(records[1].values['agreeToTerms'].value).toBeFalsy()
      expect(records[2].values['agreeToTerms'].value).toBeTruthy()
    })

    it('handles null values', async () => {
      listener.use(
        validateBoolean({
          fields: ['optIn'],
          validationType: 'truthy',
          handleNull: 'false',
        })
      )

      await createRecords(sheetId, [
        { optIn: null },
        { optIn: undefined },
        { optIn: '' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['optIn'].value).toBe(false)
      expect(records[1].values['optIn'].value).toBe(false)
      expect(records[2].values['optIn'].value).toBe(false)
    })

    it('handles errors', async () => {
      listener.use(
        validateBoolean({
          fields: ['isActive'],
          validationType: 'truthy',
        })
      )

      await createRecords(sheetId, [{ isActive: 'invalid' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['isActive'].value).toBe('invalid')
      expect(records[0].values['isActive'].messages[0].message).toContain('Invalid boolean value')
    })
  })
})
