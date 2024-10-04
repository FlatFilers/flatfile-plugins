import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { validateISBN } from './index'

const api = new FlatfileClient()

describe('validateISBN e2e', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'isbn', type: 'string' },
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

  it('validates and formats ISBNs', async () => {
    listener.use(validateISBN({ isbnFields: ['isbn'] }))

    await createRecords(sheetId, [
      { isbn: '0306406152' },
      { isbn: '9780306406157' },
      { isbn: 'invalid-isbn' },
    ])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['isbn'].value).toBe('0-306-40615-2')
    expect(records[0].values['isbn'].messages[0].message).toBe(
      'Formatted ISBN-10'
    )

    expect(records[1].values['isbn'].value).toBe('978-0-306-40615-7')
    expect(records[1].values['isbn'].messages[0].message).toBe(
      'Formatted ISBN-13'
    )

    expect(records[2].values['isbn'].value).toBe('invalid-isbn')
    expect(records[2].values['isbn'].messages[0].message).toBe(
      'Invalid ISBN format'
    )
  })

  it('converts ISBN-10 to ISBN-13 when format is specified', async () => {
    listener.use(validateISBN({ isbnFields: ['isbn'], format: 'isbn13h' }))

    await createRecords(sheetId, [{ isbn: '0306406152' }])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['isbn'].value).toBe('978-0-306-40615-7')
    expect(records[0].values['isbn'].messages[1].message).toBe(
      'Converted ISBN-13'
    )
  })

  it('does not auto-format when autoFormat is false', async () => {
    listener.use(validateISBN({ isbnFields: ['isbn'], autoFormat: false }))

    await createRecords(sheetId, [{ isbn: '0306406152' }])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['isbn'].value).toBe('0306406152')
    expect(records[0].values['isbn'].messages.length).toBe(0)
  })
})
