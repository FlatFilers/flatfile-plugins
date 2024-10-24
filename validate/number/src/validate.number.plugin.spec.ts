import { describe, expect, it } from 'vitest'
import {
  NumberValidationConfig,
  validateNumberField,
} from './validate.number.plugin'

describe('validateNumberField', () => {
  const defaultConfig: NumberValidationConfig = {}

  it('should validate a basic number', () => {
    const result = validateNumberField('123', defaultConfig)
    expect(result).toEqual({
      value: 123,
      errors: [],
      warnings: [],
    })
  })

  it('should handle non-numeric input', () => {
    const result = validateNumberField('abc', defaultConfig)
    expect(result).toEqual({
      value: null,
      errors: ['Must be a number'],
      warnings: [],
    })
  })

  it('should validate min and max constraints', () => {
    const config: NumberValidationConfig = { min: 0, max: 100 }
    expect(validateNumberField('50', config)).toEqual({
      value: 50,
      errors: [],
      warnings: [],
    })
    expect(validateNumberField('-1', config)).toEqual({
      value: -1,
      errors: [],
      warnings: ['Must be greater than 0'],
    })
    expect(validateNumberField('101', config)).toEqual({
      value: 101,
      errors: [],
      warnings: ['Must be less than 100'],
    })
  })

  it('should validate integer constraint', () => {
    const config: NumberValidationConfig = { integerOnly: true }
    expect(validateNumberField('10', config)).toEqual({
      value: 10,
      errors: [],
      warnings: [],
    })
    expect(validateNumberField('10.5', config)).toEqual({
      value: 10.5,
      errors: [],
      warnings: ['Must be an integer'],
    })
  })

  it('should validate precision and scale', () => {
    const config: NumberValidationConfig = { precision: 5, scale: 2 }
    expect(validateNumberField('123.45', config)).toEqual({
      value: 123.45,
      errors: [],
      warnings: [],
    })
    expect(validateNumberField('1234.567', config)).toEqual({
      value: 1234.567,
      errors: [],
      warnings: [
        'Must have at most 3 digits before the decimal point',
        'Must have at most 2 digits after the decimal point',
      ],
    })
  })

  it('should validate currency format', () => {
    const config: NumberValidationConfig = { currency: true }
    expect(validateNumberField('100.00', config)).toEqual({
      value: 100,
      errors: [],
      warnings: [],
    })
    expect(validateNumberField('100.123', config)).toEqual({
      value: 100.123,
      errors: [],
      warnings: [
        'Must be a valid currency value with at most two decimal places',
      ],
    })
  })

  it('should validate step constraint', () => {
    const config: NumberValidationConfig = { step: 0.5 }
    expect(validateNumberField('2.5', config)).toEqual({
      value: 2.5,
      errors: [],
      warnings: [],
    })
    expect(validateNumberField('2.7', config)).toEqual({
      value: 2.7,
      errors: [],
      warnings: ['Must be a multiple of 0.5'],
    })
  })

  it('should handle thousands separator and decimal point', () => {
    const config: NumberValidationConfig = {
      thousandsSeparator: ',',
      decimalPoint: '.',
    }
    expect(validateNumberField('1,234.56', config)).toEqual({
      value: 1234.56,
      errors: [],
      warnings: [],
    })
  })

  it('should validate special types', () => {
    const config: NumberValidationConfig = { specialTypes: ['prime', 'odd'] }
    expect(validateNumberField('7', config)).toEqual({
      value: 7,
      errors: [],
      warnings: [],
    })
    expect(validateNumberField('9', config)).toEqual({
      value: 9,
      errors: [],
      warnings: ['Must be a prime number'],
    })
    expect(validateNumberField('2', config)).toEqual({
      value: 2,
      errors: [],
      warnings: ['Must be an odd number'],
    })
  })

  it('should round numbers when configured', () => {
    const config: NumberValidationConfig = { round: true }
    expect(validateNumberField('3.7', config)).toEqual({
      value: 4,
      errors: [],
      warnings: [],
    })
  })

  it('should truncate numbers when configured', () => {
    const config: NumberValidationConfig = { truncate: true }
    expect(validateNumberField('3.7', config)).toEqual({
      value: 3,
      errors: [],
      warnings: [],
    })
  })
})
