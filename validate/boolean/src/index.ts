import { FlatfileListener } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'

interface BooleanValidatorConfig {
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

const languageMappings: Record<string, Record<string, boolean>> = {
  en: { yes: true, no: false, y: true, n: false },
  es: { sí: true, si: true, no: false, s: true, n: false },
  fr: { oui: true, non: false, o: true, n: false },
  de: { ja: true, nein: false, j: true, n: false },
}

function handleNullValue(
  record: FlatfileRecord,
  field: string,
  config: BooleanValidatorConfig
) {
  switch (config.handleNull) {
    case 'error':
      record.addError(
        field,
        config.customErrorMessages?.nullValue ||
          'Value cannot be null or undefined'
      )
      break
    case 'false':
      record.set(field, false)
      break
    case 'true':
      record.set(field, true)
      break
    case 'skip':
    default:
      // Do nothing, leave the field as is
      break
  }
}


function validateStrictBoolean(
  record: FlatfileRecord,
  field: string,
  value: any,
  config: BooleanValidatorConfig
) {
  if ( value === true || value === false) {
    record.set(field, value)
  } else if (config.convertNonBoolean) {
    record.set(field, Boolean(value))
  } else {
    handleInvalidValue(record, field, config)
  }
}

function validateTruthyBoolean(
  record: FlatfileRecord,
  field: string,
  value: any,
  config: BooleanValidatorConfig
) {
  const defaultMapping = config.language
    ? languageMappings[config.language]
    : languageMappings.en
  const mapping = config.customMapping || defaultMapping

  let normalizedValue = value
  if (typeof value === 'string' && !config.caseSensitive) {
    normalizedValue = value.toLowerCase()
  }

  if (normalizedValue === true || normalizedValue === false) {
    record.set(field, normalizedValue)
  } else if (mapping.hasOwnProperty(normalizedValue)) {
    record.set(field, mapping[normalizedValue])
  } else if (typeof normalizedValue === 'number') {
    record.set(field, Boolean(normalizedValue))
  } else if (config.convertNonBoolean) {
    record.set(field, Boolean(value))
  } else {
    handleInvalidValue(record, field, config)
  }
}
function handleInvalidValue(
  record: FlatfileRecord,
  field: string,
  config: BooleanValidatorConfig
) {
  if (config.defaultValue === undefined || config.defaultValue === 'skip') {
    record.addError(
      field,
      config.customErrorMessages?.invalidBoolean ||
        'Invalid boolean value'
    )
  } else {
    record.set(field, config.defaultValue)
    record.addInfo(
      field,
      `Invalid value converted to default: ${config.defaultValue}`
    )
  }
}

// Updated RecordHook version
export const validateBoolean = (config: BooleanValidatorConfig) => {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug || '**', async (record: FlatfileRecord) => {
        config.fields.forEach((field) => {
          const value = record.get(field)

          if (value === null || value === undefined) {
            handleNullValue(record, field, config)
          } else if (config.validationType === 'strict') {
            validateStrictBoolean(record, field, value, config)
          } else {
            validateTruthyBoolean(record, field, value, config)
          }
        })

        return record
      })
    )
  }
}

export default validateBoolean
