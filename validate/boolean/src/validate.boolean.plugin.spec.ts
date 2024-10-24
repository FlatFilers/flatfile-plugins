import { describe, expect, it } from 'vitest'
import {
  BooleanValidatorConfig,
  handleInvalidValue,
  handleNullValue,
  validateBooleanField,
  validateStrictBoolean,
  validateTruthyBoolean,
} from './validate.boolean.plugin'

describe('Boolean Validator Plugin', () => {
  describe('validateBooleanField', () => {
    const defaultConfig: BooleanValidatorConfig = {
      fields: ['test'],
      validationType: 'strict',
    }

    it('should handle null values', () => {
      const result = validateBooleanField(null, {
        ...defaultConfig,
        handleNull: 'error',
      })
      expect(result).toEqual({
        value: null,
        error: 'Value cannot be null or undefined',
      })
    })

    it('should validate strict boolean', () => {
      const result = validateBooleanField(true, defaultConfig)
      expect(result).toEqual({ value: true, error: null })
    })

    it('should validate truthy boolean', () => {
      const result = validateBooleanField('yes', {
        ...defaultConfig,
        validationType: 'truthy',
      })
      expect(result).toEqual({ value: true, error: null })
    })
  })

  describe('handleNullValue', () => {
    it('should return error for null with error config', () => {
      const result = handleNullValue(null, {
        fields: [],
        validationType: 'strict',
        handleNull: 'error',
      })
      expect(result).toEqual({
        value: null,
        error: 'Value cannot be null or undefined',
      })
    })

    it('should return false for null with false config', () => {
      const result = handleNullValue(null, {
        fields: [],
        validationType: 'strict',
        handleNull: 'false',
      })
      expect(result).toEqual({ value: false, error: null })
    })
  })

  describe('validateStrictBoolean', () => {
    const defaultConfig: BooleanValidatorConfig = {
      fields: ['test'],
      validationType: 'strict',
    }

    it('should accept true and false', () => {
      expect(validateStrictBoolean(true, defaultConfig)).toEqual({
        value: true,
        error: null,
      })
      expect(validateStrictBoolean(false, defaultConfig)).toEqual({
        value: false,
        error: null,
      })
    })

    it('should convert non-boolean when configured', () => {
      const result = validateStrictBoolean(1, {
        ...defaultConfig,
        convertNonBoolean: true,
      })
      expect(result).toEqual({ value: true, error: null })
    })

    it('should handle invalid values', () => {
      const result = validateStrictBoolean('true', defaultConfig)
      expect(result).toEqual({ value: null, error: 'Invalid boolean value' })
    })
  })

  describe('validateTruthyBoolean', () => {
    const defaultConfig: BooleanValidatorConfig = {
      fields: ['test'],
      validationType: 'truthy',
    }

    it('should accept true and false', () => {
      expect(validateTruthyBoolean(true, defaultConfig)).toEqual({
        value: true,
        error: null,
      })
      expect(validateTruthyBoolean(false, defaultConfig)).toEqual({
        value: false,
        error: null,
      })
    })

    it('should accept truthy strings', () => {
      expect(validateTruthyBoolean('yes', defaultConfig)).toEqual({
        value: true,
        error: null,
      })
      expect(validateTruthyBoolean('no', defaultConfig)).toEqual({
        value: false,
        error: null,
      })
    })

    it('should handle custom mappings', () => {
      const config = {
        ...defaultConfig,
        customMapping: { ja: true, nein: false },
      }
      expect(validateTruthyBoolean('ja', config)).toEqual({
        value: true,
        error: null,
      })
      expect(validateTruthyBoolean('nein', config)).toEqual({
        value: false,
        error: null,
      })
    })

    it('should handle case sensitivity', () => {
      const config = { ...defaultConfig, caseSensitive: true }
      expect(validateTruthyBoolean('YES', config)).toEqual({
        value: null,
        error: 'Invalid boolean value',
      })
      expect(validateTruthyBoolean('yes', config)).toEqual({
        value: true,
        error: null,
      })
    })
  })

  describe('handleInvalidValue', () => {
    const defaultConfig: BooleanValidatorConfig = {
      fields: ['test'],
      validationType: 'strict',
    }

    it('should return error for invalid value', () => {
      const result = handleInvalidValue('invalid', defaultConfig)
      expect(result).toEqual({ value: null, error: 'Invalid boolean value' })
    })

    it('should use default value when configured', () => {
      const config = { ...defaultConfig, defaultValue: true }
      const result = handleInvalidValue('invalid', config)
      expect(result).toEqual({
        value: true,
        error: 'Invalid value converted to default: true',
      })
    })
  })
})
