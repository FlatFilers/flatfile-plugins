import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateMergeKey,
  mergeRecordsWithPriority,
  RecordWithSource,
} from './multi-file.utils'

describe('multi-file utils', () => {
  describe('generateMergeKey', () => {
    it('should generate key from record field value', () => {
      const record: RecordWithSource = {
        id: '1',
        values: {
          email: { value: 'test@example.com' },
        },
      }

      const key = generateMergeKey(record, 'email')
      expect(key).toBe('test@example.com')
    })

    it('should return undefined for missing field', () => {
      const record: RecordWithSource = {
        id: '1',
        values: {},
      }

      const key = generateMergeKey(record, 'email')
      expect(key).toBeUndefined()
    })

    it('should return undefined for null value', () => {
      const record: RecordWithSource = {
        id: '1',
        values: {
          email: { value: undefined },
        },
      }

      const key = generateMergeKey(record, 'email')
      expect(key).toBeUndefined()
    })
  })

  describe('mergeRecordsWithPriority', () => {
    const createRecord = (
      id: string,
      email: string,
      name: string,
      priority: number,
      sheetName: string
    ): RecordWithSource => ({
      id,
      values: {
        email: { value: email },
        name: { value: name },
      },
      _source: {
        sheetId: `sheet-${priority}`,
        sheetName,
        priority,
      },
    })

    it('should keep highest priority record for delete strategy', () => {
      const records: RecordWithSource[] = [
        createRecord('1', 'test@example.com', 'First', 1, 'Sheet1'),
        createRecord('2', 'test@example.com', 'Second', 3, 'Sheet2'),
        createRecord('3', 'test@example.com', 'Third', 2, 'Sheet3'),
      ]

      const result = mergeRecordsWithPriority(records, 'delete')
      expect(result.id).toBe('2')
      expect(result.values.name.value).toBe('Second')
    })

    it('should merge records with priority for merge strategy', () => {
      const records: RecordWithSource[] = [
        createRecord('1', 'test@example.com', 'First', 1, 'Sheet1'),
        createRecord('2', 'test@example.com', '', 3, 'Sheet2'),
        createRecord('3', 'test@example.com', 'Third', 2, 'Sheet3'),
      ]

      records[1].values.phone = { value: '123-456-7890' }

      const result = mergeRecordsWithPriority(records, 'merge')
      expect(result.id).toBe('2')
      expect(result.values.name.value).toBe('Third')
      expect(result.values.phone.value).toBe('123-456-7890')
    })

    it('should union all values for union strategy', () => {
      const records: RecordWithSource[] = [
        createRecord('1', 'test@example.com', 'First', 1, 'Sheet1'),
        createRecord('2', 'test@example.com', '', 3, 'Sheet2'),
        createRecord('3', 'test@example.com', 'Third', 2, 'Sheet3'),
      ]

      records[1].values.phone = { value: '123-456-7890' }
      records[2].values.address = { value: '123 Main St' }

      const result = mergeRecordsWithPriority(records, 'union')
      expect(result.id).toBe('2')
      expect(result.values.name.value).toBe('Third')
      expect(result.values.phone.value).toBe('123-456-7890')
      expect(result.values.address.value).toBe('123 Main St')
    })

    it('should handle single record', () => {
      const records: RecordWithSource[] = [
        createRecord('1', 'test@example.com', 'Only', 1, 'Sheet1'),
      ]

      const result = mergeRecordsWithPriority(records, 'merge')
      expect(result.id).toBe('1')
      expect(result.values.name.value).toBe('Only')
    })
  })
})
