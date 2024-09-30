import { validateISBN } from './index'
import { FlatfileListener } from '@flatfile/listener'
import { RecordHook } from '@flatfile/plugin-record-hook'

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
import { FlatfileListener } from '@flatfile/listener'
import { validateISBN } from './index'

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
