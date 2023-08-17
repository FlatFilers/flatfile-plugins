import { castNumber, castBoolean, castDate } from './autocast.plugin'

describe('autocast plugin', () => {
  describe('cast functions', () => {
    it('should return a number', () => {
      expect(castNumber('1')).toBe(1)
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
    })
  })
})
