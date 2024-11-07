import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupDriver,
  setupSimpleWorkbook,
  setupSpace,
  TestListener,
} from '@flatfile/utils-testing'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import { validateDate } from './validate.date.plugin'

const api = new FlatfileClient()

describe('NormalizeDate e2e', () => {
  const listener = new TestListener()
  const driver = setupDriver()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'date', type: 'string' },
      { key: 'date1', type: 'string' },
      { key: 'date2', type: 'string' },
      { key: 'name', type: 'string' },
    ])
    sheetId = workbook.sheets![0].id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()
  })

  afterEach(async () => {
    listener.reset()
    const records = await getRecords(sheetId)
    if (records.length > 0) {
      const ids = records.map((record) => record.id)
      await api.records.delete(sheetId, { ids })
    }
  })

  describe('validateDate()', () => {
    it('normalizes date format', async () => {
      listener.use(
        validateDate({
          sheetSlug: 'test',
          dateFields: ['date'],
          outputFormat: 'MM/dd/yyyy',
          includeTime: false,
        })
      )

      await createRecords(sheetId, [
        { date: '2023-01-15', name: 'John' },
        { date: '15/01/2023', name: 'Jane' },
        { date: 'Jan 15, 2023', name: 'Bob' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)
      expect(records[0].values['date'].value).toBe('01/15/2023')
      expect(records[1].values['date'].value).toBe('01/15/2023')
      expect(records[2].values['date'].value).toBe('01/15/2023')
    })

    it('handles invalid date formats', async () => {
      listener.use(
        validateDate({
          sheetSlug: 'test',
          dateFields: ['date'],
          outputFormat: 'MM/dd/yyyy',
          includeTime: false,
        })
      )

      await createRecords(sheetId, [{ date: 'invalid-date', name: 'Alice' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['date'].messages?.length).toBeGreaterThan(0)
      expect(records[0].values['date'].messages?.[0].message).toContain(
        'Unable to parse date string'
      )
    })

    it('respects includeTime option', async () => {
      listener.use(
        validateDate({
          sheetSlug: 'test',
          dateFields: ['date'],
          outputFormat: 'MM/dd/yyyy HH:mm:ss',
          includeTime: true,
        })
      )

      await createRecords(sheetId, [
        { date: '2023-01-15 14:30:00', name: 'Charlie' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['date'].value).toBe('01/15/2023 14:30:00')
    })

    it('handles different locales', async () => {
      listener.use(
        validateDate({
          sheetSlug: 'test',
          dateFields: ['date'],
          outputFormat: 'dd.MM.yyyy',
          includeTime: false,
        })
      )

      await createRecords(sheetId, [{ date: '15.01.2023', name: 'Hans' }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['date'].value).toBe('15.01.2023')
    })

    it('normalizes multiple date fields', async () => {
      listener.use(
        validateDate({
          sheetSlug: 'test',
          dateFields: ['date1', 'date2'],
          outputFormat: 'yyyy-MM-dd',
          includeTime: false,
        })
      )

      await createRecords(sheetId, [
        { date1: '01/15/2023', date2: 'Jan 20, 2023', name: 'Eve' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values['date1'].value).toBe('2023-01-15')
      expect(records[0].values['date2'].value).toBe('2023-01-20')
    })
  })
})
