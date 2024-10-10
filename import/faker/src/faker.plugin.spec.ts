import { faker } from '@faker-js/faker'
import { FlatfileEvent } from '@flatfile/listener'
import { generateExampleRecords } from './faker.utils'

jest.mock('@faker-js/faker', () => ({
  faker: {
    setLocale: jest.fn(),
    name: { fullName: jest.fn(() => 'John Doe') },
    internet: { email: jest.fn(() => 'john@example.com') },
    phone: { phoneNumber: jest.fn(() => '123-456-7890') },
    address: { streetAddress: jest.fn(() => '123 Main St') },
    lorem: { word: jest.fn(() => 'lorem') },
    datatype: {
      number: jest.fn(() => 42),
      boolean: jest.fn(() => true),
      uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    },
    date: {
      past: jest.fn(() => new Date('2000-01-01')),
      recent: jest.fn(() => new Date('2023-01-01')),
    },
    random: { arrayElement: jest.fn((arr) => arr[0]) },
    commerce: { price: jest.fn(() => '9.99') },
  },
}))

describe('generateExampleRecords', () => {
  const mockEvent: FlatfileEvent = {
    sheet: {
      fields: [
        { key: 'name', type: 'string', label: 'Full Name' },
        { key: 'email', type: 'string', label: 'Email Address' },
        { key: 'age', type: 'number', label: 'Age' },
        { key: 'isActive', type: 'boolean', label: 'Is Active' },
        { key: 'birthDate', type: 'date', label: 'Birth Date' },
        {
          key: 'category',
          type: 'enum',
          label: 'Category',
          config: { options: ['A', 'B', 'C'] },
        },
        {
          key: 'userId',
          type: 'reference',
          label: 'User ID',
          config: { ref: 'users' },
        },
        {
          key: 'tags',
          type: 'array',
          label: 'Tags',
          config: { arrayType: 'string' },
        },
      ],
    },
    update: jest.fn(),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate the correct number of records', async () => {
    const records = await generateExampleRecords(mockEvent, { count: 5 })
    expect(records.length).toBe(5)
  })

  it('should set the correct locale', async () => {
    await generateExampleRecords(mockEvent, { count: 1, locale: 'fr' })
    expect(faker.setLocale).toHaveBeenCalledWith('fr')
  })

  it('should generate correct data types for each field', async () => {
    const [record] = await generateExampleRecords(mockEvent, { count: 1 })
    expect(record.name).toBe('John Doe')
    expect(record.email).toBe('john@example.com')
    expect(record.age).toBe(42)
    expect(record.isActive).toBe(true)
    expect(record.birthDate).toBe('2000-01-01T00:00:00.000Z')
    expect(record.category).toBe('A')
    expect(record.userId).toBe('123e4567-e89b-12d3-a456-426614174000')
    expect(record.tags).toEqual(['lorem', 'lorem', 'lorem'])
  })

  it('should handle errors and set error message', async () => {
    const errorEvent: FlatfileEvent = {
      ...mockEvent,
      sheet: {
        fields: [{ key: 'invalid', type: 'invalid', label: 'Invalid Field' }],
      },
    } as any

    const [record] = await generateExampleRecords(errorEvent, { count: 1 })
    expect(record.invalid).toMatch(/^Error:/)
  })

  it('should update progress', async () => {
    await generateExampleRecords(mockEvent, { count: 10, batchSize: 5 })
    expect(mockEvent.update).toHaveBeenCalledTimes(2)
    expect(mockEvent.update).toHaveBeenLastCalledWith({
      message: 'Generated 10 of 10 records',
      progress: 100,
    })
  })
})
