const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

export function validateEmailAddress(
  email: string,
  disposableDomains: string[]
): string | null {
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }

  const domain = email.split('@')[1]
  if (disposableDomains.includes(domain)) {
    return 'Disposable email addresses are not allowed'
  }

  return null
}
