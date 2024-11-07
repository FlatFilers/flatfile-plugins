import { describe, expect, it } from 'vitest'
import { validateAndTransformString, type StringValidationConfig } from '.'

describe('validateAndTransformString', () => {
  it('should validate empty string', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      emptyStringAllowed: false,
    }
    const result = validateAndTransformString('', config)
    expect(result.error).toBe('Field cannot be empty')
  })

  it('should allow empty string when configured', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      emptyStringAllowed: true,
    }
    const result = validateAndTransformString('', config)
    expect(result.error).toBeNull()
  })

  it('should validate pattern', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      pattern: 'email',
    }
    const validResult = validateAndTransformString('test@example.com', config)
    expect(validResult.error).toBeNull()

    const invalidResult = validateAndTransformString('not-an-email', config)
    expect(invalidResult.error).toBe('Invalid format')
  })

  it('should validate custom pattern', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      pattern: /^[A-Z]{3}$/,
    }
    const validResult = validateAndTransformString('ABC', config)
    expect(validResult.error).toBeNull()

    const invalidResult = validateAndTransformString('ABCD', config)
    expect(invalidResult.error).toBe('Invalid format')
  })

  it('should validate minLength', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      minLength: 3,
    }
    const validResult = validateAndTransformString('abc', config)
    expect(validResult.error).toBeNull()

    const invalidResult = validateAndTransformString('ab', config)
    expect(invalidResult.error).toBe('Minimum length is 3')
  })

  it('should validate maxLength', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      maxLength: 5,
    }
    const validResult = validateAndTransformString('abcde', config)
    expect(validResult.error).toBeNull()

    const invalidResult = validateAndTransformString('abcdef', config)
    expect(invalidResult.error).toBe('Maximum length is 5')
  })

  it('should validate exactLength', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      exactLength: 4,
    }
    const validResult = validateAndTransformString('abcd', config)
    expect(validResult.error).toBeNull()

    const invalidResult = validateAndTransformString('abc', config)
    expect(invalidResult.error).toBe('Exact length must be 4')
  })

  it('should transform to lowercase', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      caseType: 'lowercase',
    }
    const result = validateAndTransformString('ABC', config)
    expect(result.value).toBe('abc')
    expect(result.error).toBe('Field value must be in lowercase')
  })

  it('should transform to uppercase', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      caseType: 'uppercase',
    }
    const result = validateAndTransformString('abc', config)
    expect(result.value).toBe('ABC')
    expect(result.error).toBe('Field value must be in uppercase')
  })

  it('should transform to titlecase', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      caseType: 'titlecase',
    }
    const result = validateAndTransformString('hello world', config)
    expect(result.value).toBe('Hello World')
    expect(result.error).toBe('Field value must be in titlecase')
  })

  it('should trim leading whitespace', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      trim: { leading: true },
    }
    const result = validateAndTransformString('  abc', config)
    expect(result.value).toBe('abc')
    expect(result.error).toBe('Field value has leading or trailing whitespace')
  })

  it('should trim trailing whitespace', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      trim: { trailing: true },
    }
    const result = validateAndTransformString('abc  ', config)
    expect(result.value).toBe('abc')
    expect(result.error).toBe('Field value has leading or trailing whitespace')
  })

  it('should use custom error messages', () => {
    const config: StringValidationConfig = {
      fields: ['test'],
      pattern: 'email',
      errorMessages: {
        pattern: 'Custom pattern error',
      },
    }
    const result = validateAndTransformString('not-an-email', config)
    expect(result.error).toBe('Custom pattern error')
  })
})
