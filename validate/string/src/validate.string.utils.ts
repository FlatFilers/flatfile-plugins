export interface StringValidationConfig {
  fields: string[]
  sheetSlug?: string
  pattern?: keyof typeof commonRegexPatterns | RegExp
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
export const commonRegexPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,14}$/,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
}

export interface ValidationResult {
  value: string
  error: string | null
}

export function validateAndTransformString(
  value: string,
  config: StringValidationConfig
): ValidationResult {
  let transformedValue = value
  let error: string | null = null

  if (!config.emptyStringAllowed && value.trim() === '') {
    return { value, error: 'Field cannot be empty' }
  }

  const pattern =
    typeof config.pattern === 'string'
      ? commonRegexPatterns[config.pattern]
      : config.pattern
  if (pattern && !pattern.test(value)) {
    error = config.errorMessages?.pattern || 'Invalid format'
    return { value, error }
  }

  if (config.minLength && value.length < config.minLength) {
    error =
      config.errorMessages?.length || `Minimum length is ${config.minLength}`
    return { value, error }
  }

  if (config.maxLength && value.length > config.maxLength) {
    error =
      config.errorMessages?.length || `Maximum length is ${config.maxLength}`
    return { value, error }
  }

  if (config.exactLength && value.length !== config.exactLength) {
    error =
      config.errorMessages?.length ||
      `Exact length must be ${config.exactLength}`
    return { value, error }
  }

  if (config.caseType) {
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
      error =
        config.errorMessages?.case ||
        `Field value must be in ${config.caseType}`
      return { value: transformedValue, error }
    }
  }

  if (config.trim) {
    if (config.trim.leading) {
      transformedValue = transformedValue.trimStart()
    }
    if (config.trim.trailing) {
      transformedValue = transformedValue.trimEnd()
    }
    if (value !== transformedValue) {
      error =
        config.errorMessages?.trim ||
        'Field value has leading or trailing whitespace'
      return { value: transformedValue, error }
    }
  }

  return { value: transformedValue, error: null }
}
