import { describe, expect, it } from 'vitest'
import type { Flatfile } from '@flatfile/api'
import { normalizeKey, normalizeSheetConfig } from './normalize-sheet-config'

describe('normalizeKey', () => {
  it('should convert numbers to strings', () => {
    expect(normalizeKey(42)).toBe('42')
    expect(normalizeKey(0)).toBe('0')
    expect(normalizeKey(-5)).toBe('5')
  })

  it('should return empty string for null/undefined/empty', () => {
    expect(normalizeKey(null as any)).toBe('')
    expect(normalizeKey(undefined as any)).toBe('')
    expect(normalizeKey('')).toBe('')
    expect(normalizeKey('   ')).toBe('')
  })

  it('should keep numeric strings as strings', () => {
    expect(normalizeKey('123')).toBe('123')
    expect(normalizeKey('0')).toBe('0')
    expect(normalizeKey('-42')).toBe('42')
  })

  it('should handle special characters', () => {
    expect(normalizeKey('price%')).toBe('price_percent')
    expect(normalizeKey('total$')).toBe('total_dollar')
    expect(normalizeKey('price%%%')).toBe('price_percent')
    expect(normalizeKey('cost$$$')).toBe('cost_dollar')
    expect(normalizeKey('%discount$')).toBe('percent_discount_dollar')
  })

  it('should handle basic camelCase conversion', () => {
    expect(normalizeKey('firstName')).toBe('first_name')
    expect(normalizeKey('lastName')).toBe('last_name')
    expect(normalizeKey('emailAddress')).toBe('email_address')
  })

  it('should handle PascalCase conversion', () => {
    expect(normalizeKey('FirstName')).toBe('first_name')
    expect(normalizeKey('LastName')).toBe('last_name')
    expect(normalizeKey('EmailAddress')).toBe('email_address')
  })

  it('should handle consecutive uppercase letters', () => {
    expect(normalizeKey('XMLHttpRequest')).toBe('xml_http_request')
    expect(normalizeKey('HTTPStatus')).toBe('http_status')
    expect(normalizeKey('someValueXYZ')).toBe('some_value_xyz')
    expect(normalizeKey('XYZ')).toBe('xyz')
  })

  it('should handle hyphens and underscores', () => {
    expect(normalizeKey('first-name')).toBe('first_name')
    expect(normalizeKey('first_name')).toBe('first_name')
    expect(normalizeKey('first--name')).toBe('first_name')
    expect(normalizeKey('first__name')).toBe('first_name')
    expect(normalizeKey('first - _ name')).toBe('first_name')
  })

  it('should handle mixed punctuation', () => {
    expect(normalizeKey('hello!!!world')).toBe('hello_world')
    expect(normalizeKey('test@#$%^&*name')).toBe('test_dollar_percent_name')
    expect(normalizeKey('data.field.name')).toBe('data_field_name')
  })

  it('should preserve non-English characters', () => {
    expect(normalizeKey('你好世界')).toBe('你好世界')
    expect(normalizeKey('こんにちは')).toBe('こんにちは')
    expect(normalizeKey('नमस्ते')).toBe('नमस्ते')
    expect(normalizeKey('firstName你好')).toBe('first_name你好')
  })

  it('should handle complex mixed cases', () => {
    expect(normalizeKey('HTTPSConnectionURL')).toBe('https_connection_url')
    expect(normalizeKey('someValueABC123DEF')).toBe('some_value_abc123_def')
    expect(normalizeKey('FIRSTNAME')).toBe('firstname')
  })

  it('should handle edge cases', () => {
    expect(normalizeKey('a')).toBe('a')
    expect(normalizeKey('A')).toBe('a')
    expect(normalizeKey('123abc')).toBe('123abc')
    expect(normalizeKey('abc123')).toBe('abc123')
  })

   it('should handle numbers casting', () => {
    expect(normalizeKey('0')).toBe('0')
    expect(normalizeKey('000')).toBe('0')
    expect(normalizeKey('001')).toBe('1')
    expect(normalizeKey('00100')).toBe('100')
    expect(normalizeKey('000000')).toBe('0')
  })
})

describe('normalizeSheetConfig', () => {
  const mockSheetConfig: Flatfile.SheetConfig = {
    name: 'Test Sheet',
    slug: 'test-sheet',
    fields: [
      { key: 'firstName', type: 'string', label: 'First Name' },
      { key: 'lastName', type: 'string', label: 'Last Name' },
      { key: 'emailAddress', type: 'string', label: 'Email Address' },
      { key: 'phoneNumber', type: 'string', label: 'Phone Number' },
    ],
  }

  describe('transform mode (default)', () => {
    it('should normalize field keys while preserving other properties', () => {
      const result = normalizeSheetConfig(mockSheetConfig)

      expect(result.name).toBe('Test Sheet')
      expect(result.slug).toBe('test-sheet')
      expect(result.fields).toHaveLength(4)

      expect(result.fields[0].key).toBe('first_name')
      expect(result.fields[0].type).toBe('string')
      expect(result.fields[0].label).toBe('First Name')

      expect(result.fields[1].key).toBe('last_name')
      expect(result.fields[2].key).toBe('email_address')
      expect(result.fields[3].key).toBe('phone_number')
    })

    it('should work with explicit transform mode', () => {
      const result = normalizeSheetConfig(mockSheetConfig, {
        output: 'transform',
      })

      expect(result.fields[0].key).toBe('first_name')
      expect(result.fields[1].key).toBe('last_name')
    })

    it('should handle duplicate keys by adding suffixes', () => {
      const configWithDuplicates: Flatfile.SheetConfig = {
        name: 'Test Sheet',
        slug: 'test-sheet',
        fields: [
          { key: 'firstName', type: 'string', label: 'First Name 1' },
          { key: 'first_name', type: 'string', label: 'First Name 2' },
          { key: 'FirstName', type: 'string', label: 'First Name 3' },
          { key: 'first-name', type: 'string', label: 'First Name 4' },
        ],
      }

      const result = normalizeSheetConfig(configWithDuplicates)

      expect(result.fields[0].key).toBe('first_name')
      expect(result.fields[1].key).toBe('first_name_1')
      expect(result.fields[2].key).toBe('first_name_2')
      expect(result.fields[3].key).toBe('first_name_3')
    })

    it('should preserve non-field properties', () => {
      const configWithExtras: Flatfile.SheetConfig = {
        name: 'Test Sheet',
        slug: 'test-sheet',
        allowAdditionalFields: true,
        fields: [{ key: 'firstName', type: 'string', label: 'First Name' }],
        actions: [
          { operation: 'test', mode: 'foreground', label: 'Test Action' },
        ],
      }

      const result = normalizeSheetConfig(configWithExtras)

      expect(result.allowAdditionalFields).toBe(true)
      expect(result.actions).toEqual([
        { operation: 'test', mode: 'foreground', label: 'Test Action' },
      ])
    })

    it('should handle special characters in keys', () => {
      const configWithSpecialChars: Flatfile.SheetConfig = {
        name: 'Test Sheet',
        slug: 'test-sheet',
        fields: [
          { key: 'price%', type: 'number', label: 'Price Percentage' },
          { key: 'total$', type: 'number', label: 'Total Dollars' },
          { key: 'HTTPStatus', type: 'string', label: 'HTTP Status' },
        ],
      }

      const result = normalizeSheetConfig(configWithSpecialChars)

      expect(result.fields[0].key).toBe('price_percent')
      expect(result.fields[1].key).toBe('total_dollar')
      expect(result.fields[2].key).toBe('http_status')
    })
  })

  describe('validate mode', () => {
    it('should return validation results without modifying config', () => {
      const result = normalizeSheetConfig(mockSheetConfig, {
        output: 'validate',
      })

      expect(result).toHaveProperty('conflicts')
      expect(result).toHaveProperty('hasConflicts')
      expect(Array.isArray(result.conflicts)).toBe(true)
      expect(typeof result.hasConflicts).toBe('boolean')
    })

    it('should detect normalization changes', () => {
      const result = normalizeSheetConfig(mockSheetConfig, {
        output: 'validate',
      })

      expect(result.hasConflicts).toBe(true)
      expect(result.conflicts).toHaveLength(4)

      expect(result.conflicts[0]).toEqual({
        originalKey: 'firstName',
        normalizedKey: 'first_name',
        finalKey: 'first_name',
        message: 'Key "firstName" was normalized to "first_name"',
      })

      expect(result.conflicts[1]).toEqual({
        originalKey: 'lastName',
        normalizedKey: 'last_name',
        finalKey: 'last_name',
        message: 'Key "lastName" was normalized to "last_name"',
      })
    })

    it('should detect duplicate key conflicts', () => {
      const configWithDuplicates: Flatfile.SheetConfig = {
        name: 'Test Sheet',
        slug: 'test-sheet',
        fields: [
          { key: 'firstName', type: 'string', label: 'First Name 1' },
          { key: 'first_name', type: 'string', label: 'First Name 2' },
          { key: 'FirstName', type: 'string', label: 'First Name 3' },
        ],
      }

      const result = normalizeSheetConfig(configWithDuplicates, {
        output: 'validate',
      })

      expect(result.hasConflicts).toBe(true)
      expect(result.conflicts).toHaveLength(3)

      expect(result.conflicts[0]).toEqual({
        originalKey: 'firstName',
        normalizedKey: 'first_name',
        finalKey: 'first_name',
        message: 'Key "firstName" was normalized to "first_name"',
      })

      expect(result.conflicts[1]).toEqual({
        originalKey: 'first_name',
        normalizedKey: 'first_name',
        finalKey: 'first_name_1',
        message:
          'Key "first_name" conflicted with existing key, renamed to "first_name_1"',
      })

      expect(result.conflicts[2]).toEqual({
        originalKey: 'FirstName',
        normalizedKey: 'first_name',
        finalKey: 'first_name_2',
        message:
          'Key "FirstName" was normalized to "first_name" but conflicted with existing key, renamed to "first_name_2"',
      })
    })

    it('should return no conflicts for already normalized keys', () => {
      const normalizedConfig: Flatfile.SheetConfig = {
        name: 'Test Sheet',
        slug: 'test-sheet',
        fields: [
          { key: 'first_name', type: 'string', label: 'First Name' },
          { key: 'last_name', type: 'string', label: 'Last Name' },
          { key: 'email', type: 'string', label: 'Email' },
        ],
      }

      const result = normalizeSheetConfig(normalizedConfig, {
        output: 'validate',
      })

      expect(result.hasConflicts).toBe(false)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should handle empty fields array', () => {
      const emptyConfig: Flatfile.SheetConfig = {
        name: 'Empty Sheet',
        slug: 'empty-sheet',
        fields: [],
      }

      const result = normalizeSheetConfig(emptyConfig, { output: 'validate' })

      expect(result.hasConflicts).toBe(false)
      expect(result.conflicts).toHaveLength(0)
    })
  })
})
