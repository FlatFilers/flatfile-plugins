import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { disposableDomains } from './disposable-domains'

interface EmailValidationConfig {
  sheetSlug?: string
  emailFields: string[]
  errorMessages?: {
    required?: string
    invalid?: string
    disposable?: string
    domain?: string
  }
}

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

function validateEmail(email: string): string | null {
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }

  const domain = email.split('@')[1]
  if (disposableDomains.includes(domain)) {
    return 'Disposable email addresses are not allowed'
  }

  return null
}

export function emailValidationPlugin(config: EmailValidationConfig) {
  return recordHook(
    config.sheetSlug || '**',
    async (record: FlatfileRecord) => {
      const errorMessages = config.errorMessages || {}

      for (const field of config.emailFields) {
        const email = (record.get(field) as string)?.trim()
        if (!email) {
          record.addError(field, errorMessages.required || 'Email is required')
        } else {
          const errorMessage = await validateEmail(email)
          if (errorMessage) {
            record.addError(field, errorMessages.invalid || errorMessage)
          }
        }
      }

      return record
    }
  )
}
