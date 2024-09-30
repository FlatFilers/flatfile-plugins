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
