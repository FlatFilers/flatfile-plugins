import { describe, expect, it } from 'vitest'
import {
  cascadeHeaderValues,
  cascadeRowValues,
  isLikelyHeaderRow,
} from './utils'

describe('Cascade Values', () => {
  describe('isLikelyHeaderRow', () => {
    it('should identify text-based rows as headers', () => {
      const row = ['Name', 'Email', 'Age']
      expect(isLikelyHeaderRow(row)).toBe(true)
    })

    it('should not identify numeric rows as headers', () => {
      const row = [1, 2, 3]
      expect(isLikelyHeaderRow(row)).toBe(false)
    })

    it('should handle mixed content rows', () => {
      const row = ['ID', 'Name', 123]
      expect(isLikelyHeaderRow(row)).toBe(false)
    })

    it('should handle empty rows', () => {
      const row: any[] = []
      expect(isLikelyHeaderRow(row)).toBe(false)
    })
  })

  describe('cascadeRowValues', () => {
    it('should cascade values down columns', () => {
      const rows = [
        ['Invoice1', 'Item1', 100],
        ['', 'Item2', 200],
        ['', 'Item3', 300],
        ['Invoice2', 'Item4', 400],
        ['', 'Item5', 500],
      ]

      const expected = [
        ['Invoice1', 'Item1', 100],
        ['Invoice1', 'Item2', 200],
        ['Invoice1', 'Item3', 300],
        ['Invoice2', 'Item4', 400],
        ['Invoice2', 'Item5', 500],
      ]

      expect(cascadeRowValues(rows)).toEqual(expected)
    })

    it('should reset cascade on blank rows', () => {
      const rows = [
        ['Invoice1', 'Item1', 100],
        ['', 'Item2', 200],
        ['', '', ''],
        ['Invoice2', 'Item3', 300],
        ['', 'Item4', 400],
      ]

      const expected = [
        ['Invoice1', 'Item1', 100],
        ['Invoice1', 'Item2', 200],
        ['', '', ''],
        ['Invoice2', 'Item3', 300],
        ['Invoice2', 'Item4', 400],
      ]

      expect(cascadeRowValues(rows)).toEqual(expected)
    })

    it('should handle empty input', () => {
      expect(cascadeRowValues([])).toEqual([])
      expect(cascadeRowValues(null as any)).toEqual(null)
    })
  })

  describe('cascadeHeaderValues', () => {
    it('should cascade values across header rows', () => {
      const headerRows = [
        ['Person', '', 'Company', ''],
        ['Name', 'Email', 'Name', 'Address'],
      ]

      const expected = [
        ['Person', 'Person', 'Company', 'Company'],
        ['Name', 'Email', 'Name', 'Address'],
      ]

      expect(cascadeHeaderValues(headerRows)).toEqual(expected)
    })

    it('should only process likely header rows', () => {
      const headerRows = [
        ['Person', '', 'Company', ''],
        ['Name', 'Email', 'Name', 'Address'],
        [1, 2, 3, 4], // Not a header row
      ]

      const expected = [
        ['Person', 'Person', 'Company', 'Company'],
        ['Name', 'Email', 'Name', 'Address'],
        [1, 2, 3, 4], // Unchanged
      ]

      expect(cascadeHeaderValues(headerRows)).toEqual(expected)
    })

    it('should reset cascade on blank columns', () => {
      const headerRows = [
        ['Person', '', '', 'Company', ''],
        ['Name', 'Email', '', 'Name', 'Address'],
      ]

      const expected = [
        ['Person', 'Person', 'Person', 'Company', 'Company'],
        ['Name', 'Email', 'Email', 'Name', 'Address'],
      ]

      expect(cascadeHeaderValues(headerRows)).toEqual(expected)
    })

    it('should handle empty input', () => {
      expect(cascadeHeaderValues([])).toEqual([])
      expect(cascadeHeaderValues(null as any)).toEqual(null)
    })
  })
})
