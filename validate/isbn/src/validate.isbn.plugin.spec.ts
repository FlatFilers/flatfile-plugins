import { describe, expect, it } from 'vitest'
import { validateAndFormatISBN } from './validate.isbn.plugin'

describe('ISBN Validator Plugin', () => {
  describe('validateAndFormatISBN', () => {
    it('should validate and format valid ISBN-10', () => {
      const result = validateAndFormatISBN('0306406152', true)
      expect(result).toEqual({
        isValid: true,
        formattedISBN: '0-306-40615-2',
        message: 'Formatted ISBN-10',
      })
    })

    it('should validate and format valid ISBN-13', () => {
      const result = validateAndFormatISBN('9780306406157', true)
      expect(result).toEqual({
        isValid: true,
        formattedISBN: '978-0-306-40615-7',
        message: 'Formatted ISBN-13',
      })
    })

    it('should not format when autoFormat is false', () => {
      const result = validateAndFormatISBN('0306406152', false)
      expect(result).toEqual({
        isValid: true,
      })
    })

    it('should return invalid for incorrect ISBN', () => {
      const result = validateAndFormatISBN('invalid-isbn', true)
      expect(result).toEqual({
        isValid: false,
        message: 'Invalid ISBN format',
      })
    })

    it('should convert ISBN-10 to ISBN-13 when format is specified', () => {
      const result = validateAndFormatISBN('0306406152', true, 'isbn13h')
      expect(result).toEqual({
        isValid: true,
        formattedISBN: '0-306-40615-2',
        convertedISBN: '978-0-306-40615-7',
        message: 'Converted ISBN-13',
      })
    })

    it('should convert ISBN-13 to ISBN-10 when format is specified', () => {
      const result = validateAndFormatISBN('9780306406157', true, 'isbn10h')
      expect(result).toEqual({
        isValid: true,
        formattedISBN: '978-0-306-40615-7',
        convertedISBN: '0-306-40615-2',
        message: 'Converted ISBN-10',
      })
    })

    it('should handle ISBN with hyphens', () => {
      const result = validateAndFormatISBN('0-306-40615-2', true)
      expect(result).toEqual({
        isValid: true,
        formattedISBN: '0-306-40615-2',
        message: 'Formatted ISBN-10',
      })
    })

    it('should handle ISBN with spaces', () => {
      const result = validateAndFormatISBN('978 0 306 40615 7', true)
      expect(result).toEqual({
        isValid: true,
        formattedISBN: '978-0-306-40615-7',
        message: 'Formatted ISBN-13',
      })
    })
  })
})
