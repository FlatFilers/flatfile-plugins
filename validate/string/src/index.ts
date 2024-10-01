import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'

interface StringValidationConfig {
  fields: string[]
  sheetSlug?: string // Added sheetSlug parameter
  pattern?: keyof typeof commonRegexPatterns | RegExp // Allow for common regex patterns or custom
  minLength?: number
  maxLength?: number
  exactLength?: number
  caseType?: 'lowercase' | 'uppercase' | 'titlecase'
  trim?: {
    leading?: boolean
    trailing?: boolean
  }
  emptyStringAllowed?: boolean
  errorMessages?: {
    pattern?: string
    length?: string
    case?: string
    trim?: string
  }
}

const commonRegexPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,14}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
}

function StringValidation(
  value: string,
  config: StringValidationConfig
): string | null {
  if (!config.emptyStringAllowed && value.trim() === '') {
    return 'Field cannot be empty'
  }

  const pattern = typeof config.pattern === 'string' ? commonRegexPatterns[config.pattern] : config.pattern;
  if (pattern && !pattern.test(value)) {
    return config.errorMessages?.pattern || 'Invalid format'
  }

  if (config.minLength && value.length < config.minLength) {
    return (
      config.errorMessages?.length || `Minimum length is ${config.minLength}`
    )
  }

  if (config.maxLength && value.length > config.maxLength) {
    return (
      config.errorMessages?.length || `Maximum length is ${config.maxLength}`
    )
  }

  if (config.exactLength && value.length !== config.exactLength) {
    return (
      config.errorMessages?.length ||
      `Exact length must be ${config.exactLength}`
    )
  }

  if (config.caseType) {
    let transformedValue: string
    switch (config.caseType) {
      case 'lowercase':
        transformedValue = value.toLowerCase()
        break
      case 'uppercase':
        transformedValue = value.toUpperCase()
        break
      case 'titlecase':
        transformedValue = value.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        )
        break
    }
    if (value !== transformedValue) {
      return (
        config.errorMessages?.case ||
        `Field value must be in ${config.caseType}`
      )
    }
  }

  if (config.trim) {
    let trimmedValue = value
    if (config.trim.leading) {
      trimmedValue = trimmedValue.trimStart()
    }
    if (config.trim.trailing) {
      trimmedValue = trimmedValue.trimEnd()
    }
    if (value !== trimmedValue) {
      return (
        config.errorMessages?.trim ||
        'Field value has leading or trailing whitespace'
      )
    }
  }

  return null
}


export function validateString(
  config: StringValidationConfig
) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug || '**', (record) => { // Use sheetSlug in recordHook
        for (const field of config.fields) {
          const value = record.get(field) as string
          if (value !== null && value !== undefined) {
            const error = StringValidation(value, config)
            if (error) {
              record.addError(field, error)
            } 
          }
        }
        return record
      })
    )
  }
}

export default validateString
