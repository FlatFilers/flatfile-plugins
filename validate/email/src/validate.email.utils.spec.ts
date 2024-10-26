import { describe, expect, it } from 'vitest'
import { validateEmailAddress } from './validate.email.utils'

describe('validateEmailAddress', () => {
  const disposableDomains = ['disposable.com', 'temporary.net']

  it('should return valid result for valid email addresses', () => {
    expect(validateEmailAddress('user@example.com', disposableDomains)).toEqual(
      {
        isValid: true,
        email: 'user@example.com',
        error: '',
      }
    )
    expect(
      validateEmailAddress('john.doe@company.co.uk', disposableDomains)
    ).toEqual({
      isValid: true,
      email: 'john.doe@company.co.uk',
      error: '',
    })
    expect(
      validateEmailAddress('name+tag@gmail.com', disposableDomains)
    ).toEqual({
      isValid: true,
      email: 'name+tag@gmail.com',
      error: '',
    })
  })

  it('should return invalid result for invalid email format', () => {
    expect(validateEmailAddress('notanemail', disposableDomains)).toEqual({
      isValid: false,
      email: 'notanemail',
      error: 'Invalid email format',
    })
    expect(validateEmailAddress('missing@tld', disposableDomains)).toEqual({
      isValid: false,
      email: 'missing@tld',
      error: 'Invalid email format',
    })
    expect(
      validateEmailAddress('@missingusername.com', disposableDomains)
    ).toEqual({
      isValid: false,
      email: '@missingusername.com',
      error: 'Invalid email format',
    })
    expect(
      validateEmailAddress('spaces in@email.com', disposableDomains)
    ).toEqual({
      isValid: false,
      email: 'spaces in@email.com',
      error: 'Invalid email format',
    })
  })

  it('should return invalid result for disposable email addresses', () => {
    expect(
      validateEmailAddress('user@disposable.com', disposableDomains)
    ).toEqual({
      isValid: false,
      email: 'user@disposable.com',
      error: 'Disposable email addresses are not allowed',
    })
    expect(
      validateEmailAddress('test@temporary.net', disposableDomains)
    ).toEqual({
      isValid: false,
      email: 'test@temporary.net',
      error: 'Disposable email addresses are not allowed',
    })
  })

  it('should handle empty disposable domains list', () => {
    expect(validateEmailAddress('user@disposable.com', [])).toEqual({
      isValid: true,
      email: 'user@disposable.com',
      error: '',
    })
  })

  it('should be case-insensitive for email addresses', () => {
    expect(validateEmailAddress('USER@EXAMPLE.COM', disposableDomains)).toEqual(
      {
        isValid: true,
        email: 'USER@EXAMPLE.COM',
        error: '',
      }
    )
    expect(
      validateEmailAddress('user@DISPOSABLE.COM', disposableDomains)
    ).toEqual({
      isValid: false,
      email: 'user@DISPOSABLE.COM',
      error: 'Disposable email addresses are not allowed',
    })
  })
})
