const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

export function validateEmailAddress(
  email: string,
  disposableDomains: string[]
): { isValid: boolean; email: string | null; error: string | null } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, email, error: 'Invalid email format' }
  }

  const domain = email.split('@')[1].toLowerCase()
  if (disposableDomains.includes(domain)) {
    return {
      isValid: false,
      email,
      error: 'Disposable email addresses are not allowed',
    }
  }

  return { isValid: true, email, error: '' }
}
