import { validateISBN } from './index'
import { FlatfileListener } from '@flatfile/listener'
import { RecordHook } from '@flatfile/plugin-record-hook'
import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'

describe('validateISBN', () => {
  const mockListener = {} as FlatfileListener
  let recordHook: RecordHook

  beforeEach(() => {
    recordHook = validateISBN({ isbnFields: ['isbn'] })(mockListener) as RecordHook
  })

  it('should validate a correct ISBN-10', async () => {
    const record = {
      get: jest.fn().mockReturnValue('0306406152'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.addError).not.toHaveBeenCalled()
    expect(record.set).toHaveBeenCalledWith('isbn', '0-306-40615-2')
  })

  it('should validate a correct ISBN-13', async () => {
    const record = {
      get: jest.fn().mockReturnValue('9780306406157'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.addError).not.toHaveBeenCalled()
    expect(record.set).toHaveBeenCalledWith('isbn', '978-0-306-40615-7')
  })

  it('should invalidate an incorrect ISBN', async () => {
    const record = {
      get: jest.fn().mockReturnValue('1234567890'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.addError).toHaveBeenCalledWith('isbn', 'Invalid ISBN format')
  })

  it('should auto-format ISBN-10 to ISBN-13 when autoFormat is true', async () => {
    recordHook = validateISBN({ isbnFields: ['isbn'], autoFormat: true })(mockListener) as RecordHook
    const record = {
      get: jest.fn().mockReturnValue('0306406152'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.set).toHaveBeenCalledWith('isbn', '978-0-306-40615-7')
    expect(record.addInfo).toHaveBeenCalledWith('isbn', 'Formatted ISBN-13')
  })

  it('should not auto-format when autoFormat is false', async () => {
    recordHook = validateISBN({ isbnFields: ['isbn'], autoFormat: false })(mockListener) as RecordHook
    const record = {
      get: jest.fn().mockReturnValue('0306406152'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.set).not.toHaveBeenCalled()
  })

  it('should validate ISBN in specified format', async () => {
    recordHook = validateISBN({ isbnFields: ['isbn'], format: 'isbn10' })(mockListener) as RecordHook
    const record = {
      get: jest.fn().mockReturnValue('0306406152'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.set).toHaveBeenCalledWith('isbn', '0306406152')
    expect(record.addInfo).toHaveBeenCalledWith('isbn', 'Converted ISBN-10')
  })

  it('should invalidate ISBN not in specified format', async () => {
    recordHook = validateISBN({ isbnFields: ['isbn'], format: 'isbn10' })(mockListener) as RecordHook
    const record = {
      get: jest.fn().mockReturnValue('9780306406157'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.addError).toHaveBeenCalledWith('isbn', 'Invalid ISBN format')
  })

  it('should ignore non-ISBN fields', async () => {
    const record = {
      get: jest.fn().mockReturnValue('not-an-isbn'),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
    await recordHook(record)
    expect(record.addError).not.toHaveBeenCalled()
    expect(record.set).not.toHaveBeenCalled()
  })
})

describe('validateISBN e2e', () => {
  const api = new FlatfileClient()
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

  it('should validate and format ISBNs in a real sheet', async () => {
    listener.use(validateISBN())

    await createRecords(sheetId, [
      { isbn: '0306406152' },
      { isbn: '9780306406157' },
      { isbn: 'invalid-isbn' },
    ])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['isbn'].value).toBe('0-306-40615-2')
    expect(records[0].values['isbn'].messages[0].message).toBe('Formatted ISBN-10')

    expect(records[1].values['isbn'].value).toBe('978-0-306-40615-7')
    expect(records[1].values['isbn'].messages[0].message).toBe('Formatted ISBN-13')

    expect(records[2].values['isbn'].value).toBe('invalid-isbn')
    expect(records[2].values['isbn'].messages[0].message).toBe('Invalid ISBN format')
  })

  it('should convert ISBN-10 to ISBN-13 when format is specified', async () => {
    listener.use(validateISBN({ format: 'isbn13' }))

    await createRecords(sheetId, [
      { isbn: '0306406152' },
    ])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['isbn'].value).toBe('9780306406157')
    expect(records[0].values['isbn'].messages[0].message).toBe('Converted ISBN-13')
  })

  it('should not auto-format when autoFormat is false', async () => {
    listener.use(validateISBN({ autoFormat: false }))

    await createRecords(sheetId, [
      { isbn: '0306406152' },
    ])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['isbn'].value).toBe('0306406152')
    expect(records[0].values['isbn'].messages.length).toBe(0)
  })
})
import { FlatfileListener } from '@flatfile/listener'
import { validateISBN } from './index'
import { FlatfileClient } from '@flatfile/api'
import {
  createRecords,
  deleteSpace,
  getRecords,
  setupListener,
  setupSimpleWorkbook,
  setupSpace,
} from '@flatfile/utils-testing'

describe('validateISBN', () => {
  let listener: FlatfileListener
  let mockRecord: any

  beforeEach(() => {
    listener = new FlatfileListener()
    mockRecord = {
      get: jest.fn(),
      set: jest.fn(),
      addError: jest.fn(),
      addInfo: jest.fn(),
    }
  })

  it('should validate and format valid ISBN-10', async () => {
    mockRecord.get.mockReturnValue('0-306-40615-2')
    
    validateISBN()(listener)
    await listener.triggerEvent('record:*', { record: mockRecord })

    expect(mockRecord.set).toHaveBeenCalledWith('isbn', '0-306-40615-2')
    expect(mockRecord.addInfo).toHaveBeenCalledWith('isbn', 'Formatted ISBN-10')
  })

  it('should validate and format valid ISBN-13', async () => {
    mockRecord.get.mockReturnValue('978-0-306-40615-7')
    
    validateISBN()(listener)
    await listener.triggerEvent('record:*', { record: mockRecord })

    expect(mockRecord.set).toHaveBeenCalledWith('isbn', '978-0-306-40615-7')
    expect(mockRecord.addInfo).toHaveBeenCalledWith('isbn', 'Formatted ISBN-13')
  })

  it('should add error for invalid ISBN', async () => {
    mockRecord.get.mockReturnValue('invalid-isbn')
    
    validateISBN()(listener)
    await listener.triggerEvent('record:*', { record: mockRecord })

    expect(mockRecord.addError).toHaveBeenCalledWith('isbn', 'Invalid ISBN format')
  })

  it('should convert ISBN-10 to ISBN-13 when format is specified', async () => {
    mockRecord.get.mockReturnValue('0-306-40615-2')
    
    validateISBN({ format: 'isbn13' })(listener)
    await listener.triggerEvent('record:*', { record: mockRecord })

    expect(mockRecord.set).toHaveBeenCalledWith('isbn', '9780306406157')
    expect(mockRecord.addInfo).toHaveBeenCalledWith('isbn', 'Converted ISBN-13')
  })

  it('should handle multiple ISBN fields', async () => {
    mockRecord.get.mockImplementation((field) => {
      if (field === 'isbn1') return '0-306-40615-2'
      if (field === 'isbn2') return '978-0-306-40615-7'
      return null
    })
    
    validateISBN({ isbnFields: ['isbn1', 'isbn2'] })(listener)
    await listener.triggerEvent('record:*', { record: mockRecord })

    expect(mockRecord.set).toHaveBeenCalledWith('isbn1', '0-306-40615-2')
    expect(mockRecord.set).toHaveBeenCalledWith('isbn2', '978-0-306-40615-7')
    expect(mockRecord.addInfo).toHaveBeenCalledWith('isbn1', 'Formatted ISBN-10')
    expect(mockRecord.addInfo).toHaveBeenCalledWith('isbn2', 'Formatted ISBN-13')
  })
})

describe('validateISBN e2e', () => {
  const api = new FlatfileClient()
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

  it('should validate and format ISBNs in a real sheet', async () => {
    listener.use(validateISBN())

    await createRecords(sheetId, [
      { isbn: '0306406152' },
      { isbn: '9780306406157' },
      { isbn: 'invalid-isbn' },
    ])

    await listener.waitFor('commit:created')

    const records = await getRecords(sheetId)

    expect(records[0].values['isbn'].value).toBe('0-306-40615-2')
    expect(records[0].values['isbn'].messages[0].message).toBe('Formatted ISBN-10')

    expect(records[1].values['isbn'].value).toBe('978-0-306-40615-7')
    expect(records[1].values['isbn'].messages[0].message).toBe('Formatted ISBN-13')

    expect(records[2].values['isbn'].value).toBe('invalid-isbn')
    expect(records[2].values['isbn'].messages[0].message).toBe('Invalid ISBN format')
  })
})
