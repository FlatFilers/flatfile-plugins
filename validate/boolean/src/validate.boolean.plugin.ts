import { type FlatfileListener } from '@flatfile/listener'
import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'

export interface BooleanValidatorConfig {
  fields: string[]
  validationType: 'strict' | 'truthy'
  customMapping?: Record<string, boolean>
  caseSensitive?: boolean
  handleNull?: 'error' | 'false' | 'true' | 'skip'
  convertNonBoolean?: boolean
  language?: string
  customErrorMessages?: {
    invalidBoolean?: string
    invalidTruthy?: string
    nullValue?: string
  }
  defaultValue?: boolean | 'skip'
  sheetSlug?: string // New field to specify the sheet slug
}

export const languageMappings: Record<string, Record<string, boolean>> = {
  en: { yes: true, no: false, y: true, n: false },
  es: { sí: true, si: true, no: false, s: true, n: false },
  fr: { oui: true, non: false, o: true, n: false },
  de: { ja: true, nein: false, j: true, n: false },
}

export function handleNullValue(
  value: any,
  config: BooleanValidatorConfig
): { value: boolean | null; error: string | null } {
  switch (config.handleNull) {
    case 'error':
      return {
        value: null,
        error:
          config.customErrorMessages?.nullValue ||
          'Value cannot be null or undefined',
      }
    case 'false':
      return { value: false, error: null }
    case 'true':
      return { value: true, error: null }
    case 'skip':
    default:
      return { value: null, error: null }
  }
}

export function validateStrictBoolean(
  value: any,
  config: BooleanValidatorConfig
): { value: boolean | null; error: string | null } {
  if (value === true || value === false) {
    return { value, error: null }
  } else if (config.convertNonBoolean) {
    return { value: Boolean(value), error: null }
  } else {
    return handleInvalidValue(value, config)
  }
}

export function validateTruthyBoolean(
  value: any,
  config: BooleanValidatorConfig
): { value: boolean | null; error: string | null } {
  const defaultMapping = config.language
    ? languageMappings[config.language]
    : languageMappings.en
  const mapping = config.customMapping || defaultMapping

  let normalizedValue = value
  if (typeof value === 'string' && !config.caseSensitive) {
    normalizedValue = value.toLowerCase()
  }

  if (normalizedValue === true || normalizedValue === false) {
    return { value: normalizedValue, error: null }
  } else if (mapping.hasOwnProperty(normalizedValue)) {
    return { value: mapping[normalizedValue], error: null }
  } else if (typeof normalizedValue === 'number') {
    return { value: Boolean(normalizedValue), error: null }
  } else if (config.convertNonBoolean) {
    return { value: Boolean(value), error: null }
  } else {
    return handleInvalidValue(value, config)
  }
}

export function handleInvalidValue(
  value: any,
  config: BooleanValidatorConfig
): { value: boolean | null; error: string | null } {
  if (config.defaultValue === undefined || config.defaultValue === 'skip') {
    return {
      value: null,
      error:
        config.customErrorMessages?.invalidBoolean || 'Invalid boolean value',
    }
  } else {
    return {
      value: config.defaultValue as boolean,
      error: `Invalid value converted to default: ${config.defaultValue}`,
    }
  }
}

export function validateBooleanField(
  value: any,
  config: BooleanValidatorConfig
): { value: boolean | null; error: string | null } {
  if (value === null || value === undefined) {
    return handleNullValue(value, config)
  } else if (config.validationType === 'strict') {
    return validateStrictBoolean(value, config)
  } else if (config.validationType === 'truthy') {
    return validateTruthyBoolean(value, config)
  }
  return { value, error: 'Invalid validation type' }
}

// Updated RecordHook version
export const validateBoolean = (config: BooleanValidatorConfig) => {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug || '**', async (record: FlatfileRecord) => {
        config.fields.forEach((field) => {
          const value = record.get(field)
          const result = validateBooleanField(value, config)

          if (result.error) {
            record.addError(field, result.error)
          }
          if (result.value !== null) {
            record.set(field, result.value)
          }
        })

        return record
      })
    )
  }
}

export default validateBoolean
