import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'
import { validateNumber } from './index'

const api = new FlatfileClient()

describe('ValidateNumber e2e', () => {
  const listener = setupListener()

  let spaceId: string
  let sheetId: string

  beforeAll(async () => {
    const space = await setupSpace()
    spaceId = space.id
    const workbook = await setupSimpleWorkbook(space.id, [
      { key: 'amount', type: 'number' },
      { key: 'price', type: 'number' },
      { key: 'quantity', type: 'number' },
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

  describe('validateNumber()', () => {
    it('validates min and max values', async () => {
      listener.use(
        validateNumber({
          fields: ['amount'],
          min: 0,
          max: 100,
        })
      )

      await createRecords(sheetId, [
        { amount: -10 },
        { amount: 50 },
        { amount: 150 },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.amount?.messages?.[0].message).toContain(
        'must be greater than'
      )
      expect(records[1].values.amount.messages).toEqual([])
      expect(records[2].values.amount.messages?.[0].message).toContain(
        'must be less than'
      )
    })

    it('validates integer-only values', async () => {
      listener.use(
        validateNumber({
          fields: ['quantity'],
          integerOnly: true,
        })
      )

      await createRecords(sheetId, [
        { quantity: 5 },
        { quantity: 3.14 },
        { quantity: '3' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.quantity.messages).toEqual([])
      expect(records[1].values.quantity.messages?.[0].message).toContain(
        'must be an integer'
      )
      expect(records[2].values.quantity.value).toEqual(3)
    })

    it('validates precision and scale', async () => {
      listener.use(
        validateNumber({
          fields: ['price'],
          precision: 5,
          scale: 2,
        })
      )

      await createRecords(sheetId, [
        { price: 123.45 },
        { price: 1234.56 },
        { price: 12.345 },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.price.messages).toEqual([])
      expect(records[1].values.price.messages?.[0].message).toContain(
        'must have at most 3 digits before the decimal point'
      )
      expect(records[2].values.price.messages?.[0].message).toContain(
        'must have at most 2 digits after the decimal point'
      )
    })

    it('validates step values', async () => {
      listener.use(
        validateNumber({
          fields: ['amount'],
          step: 0.5,
        })
      )

      await createRecords(sheetId, [
        { amount: 1.5 },
        { amount: 2.25 },
        { amount: 3 },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.amount.messages).toEqual([])
      expect(records[1].values.amount.messages?.[0].message).toContain(
        'must be a multiple of 0.5'
      )
      expect(records[2].values.amount.messages).toEqual([])
    })

    it('handles currency values', async () => {
      listener.use(
        validateNumber({
          fields: ['price'],
          currency: true,
        })
      )

      await createRecords(sheetId, [
        { price: 10.0 },
        { price: 15.5 },
        { price: 20.555 },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.price.messages).toEqual([])
      expect(records[1].values.price.messages).toEqual([])
      expect(records[2].values.price.messages?.[0].message).toContain(
        'must be a valid currency value'
      )
    })

    it('validates special number types', async () => {
      listener.use(
        validateNumber({
          fields: ['amount'],
          specialTypes: ['even'],
        })
      )

      await createRecords(sheetId, [
        { amount: 2 },
        { amount: 3 },
        { amount: 4 },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.amount.messages).toEqual([])
      expect(records[1].values.amount.messages?.[0].message).toContain(
        'must be an even number'
      )
      expect(records[2].values.amount.messages).toEqual([])
    })

    it('handles rounding', async () => {
      listener.use(
        validateNumber({
          fields: ['amount'],
          round: true,
        })
      )

      await createRecords(sheetId, [{ amount: 1.4 }, { amount: 1.6 }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.amount.value).toBe(1)
      expect(records[1].values.amount.value).toBe(2)
    })

    it('handles truncation', async () => {
      listener.use(
        validateNumber({
          fields: ['amount'],
          truncate: true,
        })
      )

      await createRecords(sheetId, [{ amount: 1.4 }, { amount: 1.6 }])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.amount.value).toBe(1)
      expect(records[1].values.amount.value).toBe(1)
    })

    it('handles custom separators', async () => {
      listener.use(
        validateNumber({
          fields: ['amount'],
          thousandsSeparator: '.',
          decimalPoint: ',',
        })
      )

      await createRecords(sheetId, [
        { amount: '1.000,50' },
        { amount: '2,500.75' },
      ])
      await listener.waitFor('commit:created')

      const records = await getRecords(sheetId)

      expect(records[0].values.amount.value).toBe(1000.5)
      expect(records[1].values.amount.value).toBe(2.50075)
    })
  })
})
