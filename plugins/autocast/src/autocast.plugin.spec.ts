import { castNumber, castBoolean, castDate } from './autocast.plugin'

describe('autocast plugin', () => {
  describe('cast functions', () => {
    it('should return a number', () => {
      expect(castNumber('1')).toBe(1)
      expect(castNumber('1.1')).toBe(1.1)
      expect(castNumber(1)).toBe(1)
      expect(castNumber(1.1)).toBe(1.1)
    })
    it('should return a boolean', () => {
      expect(castBoolean('true')).toBe(true)
      expect(castBoolean('false')).toBe(false)
      expect(castBoolean('1')).toBe(true)
      expect(castBoolean('0')).toBe(false)
      expect(castBoolean(1)).toBe(true)
      expect(castBoolean(0)).toBe(false)
    })
    it('should return a date', () => {
      expect(castDate('2023-08-16')).toBe('Wed, 16 Aug 2023 00:00:00 GMT')
      expect(castDate('08-16-2023')).toBe('Wed, 16 Aug 2023 00:00:00 GMT')
      expect(castDate('08/16/2023')).toBe('Wed, 16 Aug 2023 00:00:00 GMT')
      expect(castDate('Aug 16, 2023')).toBe('Wed, 16 Aug 2023 00:00:00 GMT')
      expect(castDate('August 16, 2023')).toBe('Wed, 16 Aug 2023 00:00:00 GMT')
    })
    it('is uncastable; should return the original value', () => {
      expect(castNumber('foo')).toBe('foo')
      expect(castBoolean('foo')).toBe('foo')
      expect(castDate('foo')).toBe('foo')
    })
  })
})
