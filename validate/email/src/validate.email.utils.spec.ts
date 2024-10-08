import { validateEmailAddress } from './validate.email.utils'

describe('validateEmailAddress', () => {
  const disposableDomains = ['disposable.com', 'temporary.net']

  it('should return null for valid email addresses', () => {
    expect(validateEmailAddress('user@example.com', disposableDomains)).toBeNull()
    expect(validateEmailAddress('john.doe@company.co.uk', disposableDomains)).toBeNull()
    expect(validateEmailAddress('name+tag@gmail.com', disposableDomains)).toBeNull()
  })

  it('should return an error message for invalid email format', () => {
    expect(validateEmailAddress('notanemail', disposableDomains)).toBe('Invalid email format')
    expect(validateEmailAddress('missing@tld', disposableDomains)).toBe('Invalid email format')
    expect(validateEmailAddress('@missingusername.com', disposableDomains)).toBe('Invalid email format')
    expect(validateEmailAddress('spaces in@email.com', disposableDomains)).toBe('Invalid email format')
  })

  it('should return an error message for disposable email addresses', () => {
    expect(validateEmailAddress('user@disposable.com', disposableDomains)).toBe('Disposable email addresses are not allowed')
    expect(validateEmailAddress('test@temporary.net', disposableDomains)).toBe('Disposable email addresses are not allowed')
  })

  it('should handle empty disposable domains list', () => {
    expect(validateEmailAddress('user@disposable.com', [])).toBeNull()
  })

  it('should be case-insensitive for email addresses', () => {
    expect(validateEmailAddress('USER@EXAMPLE.COM', disposableDomains)).toBeNull()
    expect(validateEmailAddress('user@DISPOSABLE.COM', disposableDomains)).toBe('Disposable email addresses are not allowed')
  })
})
