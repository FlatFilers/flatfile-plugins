import { FlatfileClient } from '@flatfile/api'
import { FlatfileEvent } from '@flatfile/listener'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateExampleRecords } from './faker.utils'

// Mock FlatfileClient
vi.mock('@flatfile/api', () => ({
  FlatfileClient: vi.fn().mockImplementation(() => ({
    sheets: {
      get: vi.fn().mockResolvedValue({
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
      update: vi.fn(),
      complete: vi.fn(),
    },
  })),
}))

// Mock @faker-js/faker
vi.mock('@faker-js/faker', () => ({
  faker: {
    setLocale: vi.fn(),
    person: {
      fullName: vi.fn(() => 'John Doe'),
      firstName: vi.fn(() => 'John'),
      lastName: vi.fn(() => 'Doe'),
    },
    internet: { email: vi.fn(() => 'john@example.com') },
    phone: { number: vi.fn(() => '123-456-7890') },
    location: { streetAddress: vi.fn(() => '123 Main St') },
    lorem: { word: vi.fn(() => 'lorem') },
    number: {
      int: vi.fn(() => 42),
    },
    datatype: {
      boolean: vi.fn(() => true),
    },
    string: {
      uuid: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
    },
    date: {
      past: vi.fn(() => new Date('2000-01-01')),
      recent: vi.fn(() => new Date('2023-01-01')),
    },
    helpers: {
      arrayElement: vi.fn((arr) => arr[0]),
      arrayElements: vi.fn((arr, options) => arr.slice(0, options?.min || 3)),
    },
    commerce: { price: vi.fn(() => '9.99') },
  },
}))

// Mock createAllRecords
vi.mock('@flatfile/util-common', () => ({
  createAllRecords: vi.fn(),
}))

describe('generateExampleRecords', () => {
  const mockEvent: FlatfileEvent = {
    context: {
      sheetId: 'sheet-123',
      jobId: 'job-456',
    },
  } as any
  beforeEach(() => {
    vi.clearAllMocks()
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
    vi.mocked(FlatfileClient).mockImplementationOnce(
      () =>
        ({
          sheets: {
            get: vi.fn().mockResolvedValue({
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
            update: vi.fn(),
            complete: vi.fn(),
          },
        }) as unknown as FlatfileClient
    )

    const records = await generateExampleRecords(mockEvent, { count: 1 })
    expect(records[0].invalid).toBeUndefined()
  })
})
