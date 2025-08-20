import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateMergeKey,
  mergeRecordsWithPriority,
  RecordWithSource,
  generateFilePriority,
  createProviderTrustMatcher,
  createProviderTrustMerger,
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

    it('should generate composite key from multiple fields', () => {
      const record: RecordWithSource = {
        id: '1',
        values: {
          first_name: { value: 'John' },
          last_name: { value: 'Doe' },
          email: { value: 'john@example.com' },
        },
      }

      const key = generateMergeKey(record, ['first_name', 'last_name'])
      expect(key).toBe('John::Doe')
    })

    it('should handle missing fields in composite key', () => {
      const record: RecordWithSource = {
        id: '1',
        values: {
          first_name: { value: 'John' },
          email: { value: 'john@example.com' },
        },
      }

      const key = generateMergeKey(record, ['first_name', 'last_name'])
      expect(key).toBe('John::')
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

  describe('generateFilePriority', () => {
    it('should return exact match priority', () => {
      const priority = generateFilePriority('sheet1', { sheet1: 10 })
      expect(priority).toBe(10)
    })

    it('should return pattern match priority', () => {
      const patterns = [
        { pattern: 'peoplesoft', priority: 10 },
        { pattern: 'mdstaff', priority: 5 },
      ]

      const priority1 = generateFilePriority('Peoplesoft_Data', {}, patterns)
      expect(priority1).toBe(10)

      const priority2 = generateFilePriority('MDStaff_Import', {}, patterns)
      expect(priority2).toBe(5)
    })

    it('should return 0 for no matches', () => {
      const priority = generateFilePriority('unknown_sheet', {}, [])
      expect(priority).toBe(0)
    })

    it('should prioritize exact match over pattern', () => {
      const patterns = [{ pattern: 'test', priority: 5 }]
      const priority = generateFilePriority(
        'test_sheet',
        { test_sheet: 10 },
        patterns
      )
      expect(priority).toBe(10)
    })
  })

  describe('createProviderTrustMatcher', () => {
    const matcher = createProviderTrustMatcher()

    const createRecord = (
      id: string,
      externalId: string,
      npi: string,
      ssn: string
    ): RecordWithSource => ({
      id,
      values: {
        external_id: { value: externalId },
        npi: { value: npi },
        ssn: { value: ssn },
      },
    })

    it('should match on same external ID', () => {
      const record1 = createRecord('1', 'ext123', '', '')
      const record2 = createRecord('2', 'ext123', 'npi456', 'ssn789')

      expect(matcher(record1, record2)).toBe(true)
    })

    it('should match on same NPI with compatible SSN', () => {
      const record1 = createRecord('1', '', 'npi123', 'ssn456')
      const record2 = createRecord('2', '', 'npi123', 'ssn456')

      expect(matcher(record1, record2)).toBe(true)
    })

    it('should match on same NPI with blank SSN', () => {
      const record1 = createRecord('1', '', 'npi123', '')
      const record2 = createRecord('2', '', 'npi123', 'ssn456')

      expect(matcher(record1, record2)).toBe(true)
    })

    it('should match on same SSN with compatible NPI', () => {
      const record1 = createRecord('1', '', 'npi123', 'ssn456')
      const record2 = createRecord('2', '', 'npi123', 'ssn456')

      expect(matcher(record1, record2)).toBe(true)
    })

    it('should match on same SSN with blank NPI', () => {
      const record1 = createRecord('1', '', '', 'ssn456')
      const record2 = createRecord('2', '', 'npi123', 'ssn456')

      expect(matcher(record1, record2)).toBe(true)
    })

    it('should not match on different NPI and SSN', () => {
      const record1 = createRecord('1', '', 'npi123', 'ssn456')
      const record2 = createRecord('2', '', 'npi789', 'ssn012')

      expect(matcher(record1, record2)).toBe(false)
    })

    it('should not match when NPI same but SSN different', () => {
      const record1 = createRecord('1', '', 'npi123', 'ssn456')
      const record2 = createRecord('2', '', 'npi123', 'ssn789')

      expect(matcher(record1, record2)).toBe(false)
    })
  })

  describe('createProviderTrustMerger', () => {
    const merger = createProviderTrustMerger()

    const createRecord = (
      id: string,
      externalId: string,
      firstName: string,
      npi: string,
      priority: number,
      sheetName: string
    ): RecordWithSource => ({
      id,
      values: {
        external_id: { value: externalId },
        first_name: { value: firstName },
        npi: { value: npi },
        license_number: { value: `license_${id}` },
      },
      _source: {
        sheetId: `sheet_${id}`,
        sheetName,
        priority,
      },
    })

    it('should prioritize populated core fields from higher priority source', () => {
      const record1 = createRecord('1', '', 'Gary', '', 5, 'MDStaff')
      const record2 = createRecord(
        '2',
        'ext123',
        'Gary',
        '6863666149',
        10,
        'Peoplesoft'
      )

      const result = merger([record1, record2])

      expect(result.id).toBe('2') // Higher priority record
      expect(result.values.external_id.value).toBe('ext123') // From Peoplesoft
      expect(result.values.first_name.value).toBe('Gary') // Same in both
      expect(result.values.npi.value).toBe('6863666149') // From Peoplesoft
    })

    it('should fill missing core fields from lower priority sources', () => {
      const record1 = createRecord(
        '1',
        'ext123',
        'Gary',
        '6863666149',
        5,
        'MDStaff'
      )
      const record2 = createRecord('2', '', 'Gary', '', 10, 'Peoplesoft')

      const result = merger([record1, record2])

      expect(result.id).toBe('2') // Higher priority record
      expect(result.values.external_id.value).toBe('ext123') // Filled from MDStaff
      expect(result.values.npi.value).toBe('6863666149') // Filled from MDStaff
    })

    it('should merge non-core fields', () => {
      const record1 = createRecord('1', 'ext123', 'Gary', '', 5, 'MDStaff')
      const record2 = createRecord(
        '2',
        'ext123',
        'Gary',
        '6863666149',
        10,
        'Peoplesoft'
      )

      const result = merger([record1, record2])

      expect(result.values.license_number.value).toBe('license_2') // From higher priority
    })
  })
})
