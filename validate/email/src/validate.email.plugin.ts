import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { validateEmailAddress } from './validate.email.utils'

export interface EmailValidationConfig {
  sheetSlug?: string
  emailFields: string[]
  disposableDomains?: string[]
  errorMessages?: {
    required?: string
    invalid?: string
    disposable?: string
    domain?: string
  }
}

export function validateEmail(config: EmailValidationConfig) {
  return recordHook(config.sheetSlug || '**', (record: FlatfileRecord) => {
    const errorMessages = config.errorMessages || {}

    for (const field of config.emailFields) {
      const email = (record.get(field) as string)?.trim()
      if (!email) {
        record.addError(field, errorMessages.required || 'Email is required')
      } else {
        const validationResult = validateEmailAddress(
          email,
          config.disposableDomains || []
        )

        if (!validationResult.isValid) {
          let errorMessage = errorMessages.invalid || validationResult.error

          if (
            validationResult.error ===
            'Disposable email addresses are not allowed'
          ) {
            errorMessage = errorMessages.disposable || validationResult.error
          }

          record.addError(field, errorMessage)
        }
      }
    }

    return record
  })
}
