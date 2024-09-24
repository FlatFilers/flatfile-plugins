import { recordHook } from '@flatfile/plugin-record-hook'
import { FlatfileListener } from '@flatfile/listener'
import dns from 'dns'
import disposableDomains from './disposable-domains.json'

interface EmailValidationConfig {
  sheetSlug: string
  emailFields: string[]
  automaticValidation: boolean
  errorMessages?: {
    required?: string
    invalid?: string
    disposable?: string
    domain?: string
  }
}

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

async function validateEmail(email: string): Promise<string | null> {
  if (!emailRegex.test(email)) {
    return 'Invalid email format'
  }

  const domain = email.split('@')[1]
  if (disposableDomains.includes(domain)) {
    return 'Disposable email addresses are not allowed'
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      await dns.promises.resolve(domain)
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        return 'Domain does not exist'
      } else if (error.code === 'ETIMEDOUT') {
        return 'DNS lookup timed out'
      } else {
        return 'Invalid domain'
      }
    }
  }

  return null
}

export default function emailValidationPlugin(config: EmailValidationConfig) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug, async (record) => {
        if (!config.automaticValidation) {
          return record
        }

        const errorMessages = config.errorMessages || {}

        for (const field of config.emailFields) {
          const email = (record.get(field) as string)?.trim()
          if (!email) {
            record.addError(
              field,
              errorMessages.required || 'Email is required'
            )
          } else {
            const errorMessage = await validateEmail(email)
            if (errorMessage) {
              record.addError(field, errorMessages.invalid || errorMessage)
            }
          }
        }

        return record
      })
    )
  }
}
