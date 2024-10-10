import { FlatfileEvent } from '@flatfile/listener'
import { generateExampleRecords } from './faker.utils'
import { FlatfileClient } from '@flatfile/api'

// Mock FlatfileClient
jest.mock('@flatfile/api', () => ({
  FlatfileClient: jest.fn().mockImplementation(() => ({
    sheets: {
      get: jest.fn().mockResolvedValue({
        data: {
          config: {
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
        },
      }),
    },
    jobs: {
      update: jest.fn(),
      complete: jest.fn(),
    },
  })),
}))

// Mock @faker-js/faker
jest.mock('@faker-js/faker', () => ({
  faker: {
    setLocale: jest.fn(),
    person: {
      fullName: jest.fn(() => 'John Doe'),
      firstName: jest.fn(() => 'John'),
      lastName: jest.fn(() => 'Doe'),
    },
    internet: { email: jest.fn(() => 'john@example.com') },
    phone: { number: jest.fn(() => '123-456-7890') },
    location: { streetAddress: jest.fn(() => '123 Main St') },
    lorem: { word: jest.fn(() => 'lorem') },
    number: {
      int: jest.fn(() => 42),
    },
    datatype: {
      boolean: jest.fn(() => true),
    },
    string: {
      uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    },
    date: {
      past: jest.fn(() => new Date('2000-01-01')),
      recent: jest.fn(() => new Date('2023-01-01')),
    },
    helpers: {
      arrayElement: jest.fn((arr) => arr[0]),
      arrayElements: jest.fn((arr, options) => arr.slice(0, options?.min || 3)),
    },
    commerce: { price: jest.fn(() => '9.99') },
  },
}))

// Mock createAllRecords
jest.mock('@flatfile/util-common', () => ({
  createAllRecords: jest.fn(),
}))

describe('generateExampleRecords', () => {
  const mockEvent: FlatfileEvent = {
    context: {
      sheetId: 'sheet-123',
      jobId: 'job-456',
    },
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate the correct number of records', async () => {
    const records = await generateExampleRecords(mockEvent, { count: 5 })
    expect(records.length).toBe(5)
  })

  it('should generate correct data types for each field', async () => {
    const [record] = await generateExampleRecords(mockEvent, { count: 1 })
    expect(record.name.value).toBe('John Doe')
    expect(record.email.value).toBe('john@example.com')
    expect(record.age.value).toBe(42)
    expect(record.isActive.value).toBe(true)
    expect(record.birthDate.value).toBe('Sat Jan 01 2000')
    expect(record.category.value).toBe('A')
    expect(record.userId.value).toBe('123e4567-e89b-12d3-a456-426614174000')
    expect(Array.isArray(record.tags.value)).toBe(true)
    if (Array.isArray(record.tags.value)) {
      expect(record.tags.value.length).toBeGreaterThanOrEqual(2)
      expect(record.tags.value.length).toBeLessThanOrEqual(5)
      expect(
        record.tags.value.every((tag: string) =>
          ['lorem', 'ipsum', 'dolor'].includes(tag)
        )
      ).toBe(true)
    }
  })

  it('should handle errors and set error message', async () => {
    // Mock the API to return an invalid field type
    ;(FlatfileClient as jest.Mock).mockImplementationOnce(() => ({
      sheets: {
        get: jest.fn().mockResolvedValue({
          data: {
            config: {
              fields: [
                { key: 'invalid', type: 'invalid', label: 'Invalid Field' },
              ],
            },
          },
        }),
      },
      jobs: {
        update: jest.fn(),
        complete: jest.fn(),
      },
    }))

    const records = await generateExampleRecords(mockEvent, { count: 1 })
    expect(records[0].invalid).toBeUndefined()
  })
})
