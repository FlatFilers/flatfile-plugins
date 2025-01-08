import { describe, expect, it } from 'vitest'
import { prependNonUniqueHeaderColumns } from './utils'

describe('utils', () => {
  describe('prependNonUniqueHeaderColumns', () => {
    it('should handle unique values correctly', () => {
      const input = ['value1', 'value2', 'value3']
      const expected = ['value1', 'value2', 'value3']

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle non-unique values correctly', () => {
      const input = ['value', 'value', 'value']
      const expected = ['value', 'value_1', 'value_2']

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle empty values correctly', () => {
      const input = ['', 'value', '']
      const expected = ['empty', 'value', 'empty_1']

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should remove asterisks from values', () => {
      const input = ['val*ue', 'val*ue', 'val*ue']
      const expected = ['value', 'value_1', 'value_2']

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle mixed cases of unique, non-unique, and empty values', () => {
      const input = ['value', '', 'value', 'unique', '']
      const expected = ['value', 'empty', 'value_1', 'unique', 'empty_1']

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })

    it('should handle case sensitivity correctly', () => {
      const input = ['value', 'Value', 'value', 'VALUE']
      const expected = ['value', 'Value', 'value_1', 'VALUE']

      expect(prependNonUniqueHeaderColumns(input)).toEqual(expected)
    })
  })
})
