import { describe, it, expect } from 'vitest'
import {
  RecordWithSource,
  generateMergeKey,
  mergeRecordsWithPriority,
  generateFilePriority,
  createConditionalMatcher,
  createPriorityMerger,
  createProviderTrustMatcher,
  createProviderTrustMerger,
} from './multi-file.utils'

function createMockRecord(
  id: string,
  values: Record<string, any>,
  sheetName: string = 'test',
  priority: number = 0
): RecordWithSource {
  const recordValues: Record<string, { value: any }> = {}
  for (const [key, value] of Object.entries(values)) {
    recordValues[key] = { value }
  }

  return {
    id,
    values: recordValues,
    _source: {
      sheetId: `sheet_${sheetName}`,
      sheetName,
      priority,
    },
  }
}

describe('multi-file.utils', () => {
  describe('generateMergeKey', () => {
    it('should generate key from single field', () => {
      const record = createMockRecord('1', { email: 'test@example.com' })
      const key = generateMergeKey(record, 'email')
      expect(key).toBe('test@example.com')
    })

    it('should generate composite key from multiple fields', () => {
      const record = createMockRecord('1', { 
        first_name: 'John', 
        last_name: 'Doe',
        email: 'john@example.com'
      })
      const key = generateMergeKey(record, ['first_name', 'last_name'])
      expect(key).toBe('John|Doe')
    })

    it('should return null for empty values', () => {
      const record = createMockRecord('1', { email: '' })
      const key = generateMergeKey(record, 'email')
      expect(key).toBeNull()
    })

    it('should handle missing fields', () => {
      const record = createMockRecord('1', { name: 'John' })
      const key = generateMergeKey(record, 'email')
      expect(key).toBeNull()
    })
  })

  describe('generateFilePriority', () => {
    it('should return exact name match priority', () => {
      const priority = generateFilePriority('primary-contacts', { 'primary-contacts': 10 }, [])
      expect(priority).toBe(10)
    })

    it('should return pattern match priority', () => {
      const priority = generateFilePriority('peoplesoft-data.csv', {}, [
        { pattern: 'peoplesoft', priority: 10 },
        { pattern: 'mdstaff', priority: 5 }
      ])
      expect(priority).toBe(10)
    })

    it('should return 0 for no matches', () => {
      const priority = generateFilePriority('unknown-file', {}, [])
      expect(priority).toBe(0)
    })
  })

  describe('mergeRecordsWithPriority', () => {
    it('should merge records with delete strategy', () => {
      const record1 = createMockRecord('1', { name: 'John', email: 'john@example.com' }, 'high', 10)
      const record2 = createMockRecord('2', { name: 'Jane', email: 'jane@example.com' }, 'low', 5)
      
      const result = mergeRecordsWithPriority([record1, record2], 'delete')
      expect(result.id).toBe('1')
      expect(result.values.name.value).toBe('John')
    })

    it('should merge records with merge strategy', () => {
      const record1 = createMockRecord('1', { name: 'John', email: '' }, 'high', 10)
      const record2 = createMockRecord('2', { name: '', email: 'john@example.com' }, 'low', 5)
      
      const result = mergeRecordsWithPriority([record1, record2], 'merge')
      expect(result.values.name.value).toBe('John')
      expect(result.values.email.value).toBe('john@example.com')
    })

    it('should merge records with union strategy', () => {
      const record1 = createMockRecord('1', { tags: 'urgent,important' }, 'high', 10)
      const record2 = createMockRecord('2', { tags: 'follow-up,important' }, 'low', 5)
      
      const result = mergeRecordsWithPriority([record1, record2], 'union')
      expect(result.values.tags.value).toBe('urgent; important; follow-up')
    })
  })

  describe('createConditionalMatcher', () => {
    it('should match records with primary field only rule', () => {
      const matcher = createConditionalMatcher({
        rules: [{ primaryField: 'customer_id' }]
      })
      
      const record1 = createMockRecord('1', { customer_id: 'CUST123', email: 'john@example.com' })
      const record2 = createMockRecord('2', { customer_id: 'CUST123', email: 'jane@example.com' })
      
      expect(matcher(record1, record2)).toBe(true)
    })

    it('should match records with primary and non-conflicting secondary field', () => {
      const matcher = createConditionalMatcher({
        rules: [{ primaryField: 'email', secondaryField: 'phone', requireBothPopulated: false }]
      })
      
      const record1 = createMockRecord('1', { email: 'john@example.com', phone: '555-1234' })
      const record2 = createMockRecord('2', { email: 'john@example.com', phone: '' })
      
      expect(matcher(record1, record2)).toBe(true)
    })

    it('should not match records with conflicting secondary field', () => {
      const matcher = createConditionalMatcher({
        rules: [{ primaryField: 'email', secondaryField: 'phone', requireBothPopulated: false }]
      })
      
      const record1 = createMockRecord('1', { email: 'john@example.com', phone: '555-1234' })
      const record2 = createMockRecord('2', { email: 'john@example.com', phone: '555-5678' })
      
      expect(matcher(record1, record2)).toBe(false)
    })

    it('should match with requireBothPopulated when both fields match', () => {
      const matcher = createConditionalMatcher({
        rules: [{ primaryField: 'ssn', secondaryField: 'last_name', requireBothPopulated: true }]
      })
      
      const record1 = createMockRecord('1', { ssn: '123-45-6789', last_name: 'Smith' })
      const record2 = createMockRecord('2', { ssn: '123-45-6789', last_name: 'Smith' })
      
      expect(matcher(record1, record2)).toBe(true)
    })
  })

  describe('createPriorityMerger', () => {
    it('should merge priority fields by taking first populated value from highest priority', () => {
      const merger = createPriorityMerger({
        priorityFields: ['customer_id', 'email', 'first_name']
      })
      
      const record1 = createMockRecord('1', { 
        customer_id: 'CUST123', 
        email: '', 
        first_name: 'John'
      }, 'primary', 10)
      
      const record2 = createMockRecord('2', { 
        customer_id: '', 
        email: 'john@example.com', 
        first_name: 'Johnny'
      }, 'secondary', 5)
      
      const result = merger([record1, record2])
      
      expect(result.values.customer_id.value).toBe('CUST123')
      expect(result.values.email.value).toBe('john@example.com')
      expect(result.values.first_name.value).toBe('John')
    })

    it('should merge union fields by combining unique values', () => {
      const merger = createPriorityMerger({
        unionFields: ['tags', 'categories']
      })
      
      const record1 = createMockRecord('1', { 
        tags: 'urgent,important', 
        categories: 'sales'
      }, 'source1', 10)
      
      const record2 = createMockRecord('2', { 
        tags: 'follow-up,important', 
        categories: 'marketing'
      }, 'source2', 5)
      
      const result = merger([record1, record2])
      
      expect(result.values.tags.value).toBe('urgent; important; follow-up')
      expect(result.values.categories.value).toBe('sales; marketing')
    })

    it('should handle single record', () => {
      const merger = createPriorityMerger()
      const record = createMockRecord('1', { customer_id: 'CUST123' })
      
      const result = merger([record])
      expect(result).toBe(record)
    })

    it('should throw error for empty array', () => {
      const merger = createPriorityMerger()
      expect(() => merger([])).toThrow('Cannot merge empty record array')
    })
  })

  describe('createProviderTrustMatcher', () => {
    it('should match records with same external_id', () => {
      const matcher = createProviderTrustMatcher()
      
      const record1 = createMockRecord('1', { external_id: 'EXT123', npi: '1234567890', ssn: '123-45-6789' })
      const record2 = createMockRecord('2', { external_id: 'EXT123', npi: '0987654321', ssn: '987-65-4321' })
      
      expect(matcher(record1, record2)).toBe(true)
    })

    it('should match records with same NPI and non-conflicting SSN', () => {
      const matcher = createProviderTrustMatcher()
      
      const record1 = createMockRecord('1', { external_id: 'EXT123', npi: '1234567890', ssn: '123-45-6789' })
      const record2 = createMockRecord('2', { external_id: 'EXT456', npi: '1234567890', ssn: '' })
      
      expect(matcher(record1, record2)).toBe(true)
    })

    it('should match records with same SSN and non-conflicting NPI', () => {
      const matcher = createProviderTrustMatcher()
      
      const record1 = createMockRecord('1', { external_id: 'EXT123', npi: '', ssn: '123-45-6789' })
      const record2 = createMockRecord('2', { external_id: 'EXT456', npi: '1234567890', ssn: '123-45-6789' })
      
      expect(matcher(record1, record2)).toBe(true)
    })

    it('should not match records with conflicting SSN when NPI matches', () => {
      const matcher = createProviderTrustMatcher()
      
      const record1 = createMockRecord('1', { external_id: 'EXT123', npi: '1234567890', ssn: '123-45-6789' })
      const record2 = createMockRecord('2', { external_id: 'EXT456', npi: '1234567890', ssn: '987-65-4321' })
      
      expect(matcher(record1, record2)).toBe(false)
    })

    it('should not match records with no matching criteria', () => {
      const matcher = createProviderTrustMatcher()
      
      const record1 = createMockRecord('1', { external_id: 'EXT123', npi: '1234567890', ssn: '123-45-6789' })
      const record2 = createMockRecord('2', { external_id: 'EXT456', npi: '0987654321', ssn: '987-65-4321' })
      
      expect(matcher(record1, record2)).toBe(false)
    })
  })

  describe('createProviderTrustMerger', () => {
    it('should merge records prioritizing populated values from higher priority sources', () => {
      const merger = createProviderTrustMerger()
      
      const record1 = createMockRecord('1', { 
        external_id: 'EXT123', 
        first_name: 'John', 
        middle_name: '', 
        npi: '1234567890' 
      }, 'peoplesoft', 10)
      
      const record2 = createMockRecord('2', { 
        external_id: '', 
        first_name: 'John', 
        middle_name: 'Michael', 
        npi: '' 
      }, 'mdstaff', 5)
      
      const result = merger([record1, record2])
      
      expect(result.values.external_id.value).toBe('EXT123')
      expect(result.values.first_name.value).toBe('John')
      expect(result.values.middle_name.value).toBe('Michael')
      expect(result.values.npi.value).toBe('1234567890')
    })

    it('should handle single record', () => {
      const merger = createProviderTrustMerger()
      const record = createMockRecord('1', { external_id: 'EXT123' })
      
      const result = merger([record])
      expect(result).toBe(record)
    })

    it('should throw error for empty array', () => {
      const merger = createProviderTrustMerger()
      expect(() => merger([])).toThrow('Cannot merge empty record array')
    })
  })
})
