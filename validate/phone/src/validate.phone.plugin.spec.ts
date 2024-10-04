import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { validatePhone } from './index'

const api = new FlatfileClient()

describe('validatePhone e2e', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'phone', type: 'string' },
      { key: 'country', type: 'string' },
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

  it('validates and formats phone numbers', async () => {
    listener.use(
      validatePhone({
        phoneField: 'phone',
        countryField: 'country',
      })
    )

    await createRecords(sheetId, [
      { phone: '4026911111', country: 'US' },
      { phone: '020 7123 4567', country: 'UK' },
      { phone: 'invalid-phone', country: 'US' },
    ])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)
    console.log(
      `validates and formats phone numbers: ${JSON.stringify(records)}`
    )

    expect(records[0].values['phone'].value).toBe('(402) 691-1111')

    expect(records[1].values['phone'].value).toBe('020 7123 4567')

    expect(records[2].values['phone'].value).toBe('invalid-phone')
    expect(records[2].values['phone'].messages?.[0].message).toBe(
      'Invalid phone number format for US'
    )
  })

  it('validates and formats phone numbers', async () => {
    listener.use(
      validatePhone({
        phoneField: 'phone',
        countryField: 'country',
        format: 'INTERNATIONAL',
      })
    )

    await createRecords(sheetId, [
      { phone: '2345678901', country: 'US' },
      { phone: '020 7123 4567', country: 'UK' },
      { phone: 'invalid-phone', country: 'US' },
    ])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)
    console.log(
      `validates and formats phone numbers: ${JSON.stringify(records)}`
    )

    expect(records[0].values['phone'].value).toBe('+1 234 567 8901')

    expect(records[1].values['phone'].value).toBe('020 7123 4567')

    expect(records[2].values['phone'].value).toBe('invalid-phone')
    expect(records[2].values['phone'].messages?.[0].message).toBe(
      'Invalid phone number format for US'
    )
  })

  it('handles missing country information', async () => {
    listener.use(
      validatePhone({ phoneField: 'phone', countryField: 'country' })
    )

    await createRecords(sheetId, [{ phone: '1234567890', country: '' }])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['country'].messages?.[0].message).toBe(
      'Country is required for phone number formatting'
    )
  })

  it('does not auto-format when autoConvert is false', async () => {
    listener.use(
      validatePhone({
        phoneField: 'phone',
        countryField: 'country',
        autoConvert: false,
      })
    )

    await createRecords(sheetId, [{ phone: '1234567890', country: 'US' }])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['phone'].value).toBe('1234567890')
    expect(records[0].values['phone'].messages?.[0].message).toBe(
      'Invalid phone number format for US'
    )
  })
})
