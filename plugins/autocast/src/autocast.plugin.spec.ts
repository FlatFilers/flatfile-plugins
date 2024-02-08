import {
  FALSY_VALUES,
  TRUTHY_VALUES,
  castBoolean,
  castDate,
  castNumber,
} from './autocast.plugin'

describe('autocast plugin', () => {
  describe('cast functions', () => {
    describe.each(['1', 1])('should return a number', (num) => {
      expect(castNumber(num)).toBe(1)
    })
    describe.each(['1.1', 1.1])('should return a decimal', (num) => {
      expect(castNumber(num)).toBe(1.1)
    })
    it('string numbers with commas should return a number', () => {
      expect(castNumber('1,100')).toBe(1100)
    })
    describe.each(TRUTHY_VALUES)('should return a truthy boolean', (truthy) => {
      expect(castBoolean(truthy)).toBe(true)
    })
    describe.each(FALSY_VALUES)('should return a falsy boolean', (falsy) => {
      expect(castBoolean(falsy)).toBe(false)
    })
    describe.each([
      '2023-08-16',
      '08-16-2023',
      '08/16/2023',
      'Aug 16, 2023',
      'August 16, 2023',
      '2023-08-16T00:00:00.000Z',
      1692144000000,
      '1692144000000',
    ])('should return a date', (date) => {
      expect(castDate(date)).toBe('Wed, 16 Aug 2023 00:00:00 GMT')
    })
    describe.each([
      [castNumber, 'number'],
      [castBoolean, 'boolean'],
      [castDate, 'date'],
    ])('is uncastable; should throw error', (castFn, type) => {
      expect(() => castFn('foo')).toThrow(`Invalid ${type}`)
    })
  })
})
