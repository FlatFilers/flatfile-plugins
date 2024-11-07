import { describe, expect, it } from 'vitest'
import { prependNonUniqueHeaderColumns } from './utils'

describe('utils', () => {
  describe('prependNonUniqueHeaderColumns', () => {
    it('should handle unique values correctly', () => {
      const input = { a: 'value1', b: 'value2', c: 'value3' }
      const expected = { a: 'value1', b: 'value2', c: 'value3' }

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle non-unique values correctly', () => {
      const input = { a: 'value', b: 'value', c: 'value' }
      const expected = { a: 'value', b: 'value_1', c: 'value_2' }

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle empty values correctly', () => {
      const input = { a: '', b: 'value', c: '' }
      const expected = { a: 'empty', b: 'value', c: 'empty_1' }

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should remove asterisks from values', () => {
      const input = { a: 'val*ue', b: 'val*ue', c: 'val*ue' }
      const expected = { a: 'value', b: 'value_1', c: 'value_2' }

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle mixed cases of unique, non-unique, and empty values', () => {
      const input = { a: 'value', b: '', c: 'value', d: 'unique', e: '' }
      const expected = {
        a: 'value',
        b: 'empty',
        c: 'value_1',
        d: 'unique',
        e: 'empty_1',
      }

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle case sensitivity correctly', () => {
      const input = { a: 'value', b: 'Value', c: 'value', d: 'VALUE' }
      const expected = { a: 'value', b: 'Value', c: 'value_1', d: 'VALUE' }

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })
  })
})
