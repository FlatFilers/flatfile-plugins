import { recordHook } from '@flatfile/plugin-record-hook'
import { FlatfileListener } from '@flatfile/listener'
import { asyncBatch } from '@flatfile/util-common'

interface ValidationOptions {
  strict: boolean
  allowTruthyFalsy: boolean
  customTruthyValues?: string[]
  customFalsyValues?: string[]
  caseSensitive?: boolean
  allowNull?: boolean
  convertNonBoolean?: boolean
  languageRepresentations?: Record<string, { true: string[]; false: string[] }>
  errorMessages?: {
    invalidBoolean?: string
    nullNotAllowed?: string
    strictModeViolation?: string
  }
  defaultValue?: boolean | null
  batchSize?: number
}

export default function booleanValidatorPlugin(
  listener: FlatfileListener,
  options: ValidationOptions = {
    strict: false,
    allowTruthyFalsy: true,
    caseSensitive: false,
    allowNull: true,
    convertNonBoolean: true,
    languageRepresentations: {
      en: { true: ['true', 'yes'], false: ['false', 'no'] },
      es: { true: ['verdadero', 'sí'], false: ['falso', 'no'] },
      fr: { true: ['vrai', 'oui'], false: ['faux', 'non'] },
    },
    errorMessages: {
      invalidBoolean: 'Invalid boolean value',
      nullNotAllowed: 'Null or undefined values are not allowed',
      strictModeViolation: 'Only true or false are allowed in strict mode',
    },
    defaultValue: null,
    batchSize: 1000,
  }
) {
  listener.use(
    recordHook(
      '**',
      async (records, event) => {
        try {
          await asyncBatch({
            items: records,
            batchSize: options.batchSize || 1000,
            asyncFn: async (batch) => {
              await Promise.all(
                batch.map(async (record) => {
                  for (const [fieldName, value] of Object.entries(
                    record.values
                  )) {
                    if (isBooleanField(fieldName)) {
                      validateBoolean(record, fieldName, value, options)
                    }
                  }
                })
              )
            },
          })
          return records
        } catch (error) {
          console.error('Error in booleanValidatorPlugin:', error)
          throw error
        }
      },
      {
        concurrency: 10,
        debug: false,
      }
    )
  )
}

function isBooleanField(fieldName: string): boolean {
  return fieldName.endsWith('_bool')
}

function validateBoolean(
  record: any,
  fieldName: string,
  value: any,
  options: ValidationOptions
): void {
  if (value === null || value === undefined) {
    if (options.allowNull) {
      return
    } else {
      record.addError(
        fieldName,
        options.errorMessages?.nullNotAllowed ||
          'Null or undefined values are not allowed'
      )
      return
    }
  }

  if (typeof value === 'boolean') {
    return
  }

  if (options.strict) {
    record.addError(
      fieldName,
      options.errorMessages?.strictModeViolation ||
        'Only true or false are allowed in strict mode'
    )
    return
  }

  if (typeof value === 'string') {
    const stringValue = options.caseSensitive ? value : value.toLowerCase()
    const trimmedValue = stringValue.trim()

    if (['true', 'false'].includes(trimmedValue)) {
      const boolValue = trimmedValue === 'true'
      record.set(fieldName, boolValue)
      return
    }

    if (options.allowTruthyFalsy) {
      const defaultTruthyValues = ['yes', '1', 'on']
      const defaultFalsyValues = ['no', '0', 'off']

      const truthyValues = options.customTruthyValues || defaultTruthyValues
      const falsyValues = options.customFalsyValues || defaultFalsyValues

      if (truthyValues.includes(trimmedValue)) {
        record.set(fieldName, true)
        return
      }
      if (falsyValues.includes(trimmedValue)) {
        record.set(fieldName, false)
        return
      }
    }

    if (options.languageRepresentations) {
      for (const langRepresentations of Object.values(
        options.languageRepresentations
      )) {
        if (langRepresentations.true.includes(trimmedValue)) {
          record.set(fieldName, true)
          return
        }
        if (langRepresentations.false.includes(trimmedValue)) {
          record.set(fieldName, false)
          return
        }
      }
    }
  }

  if (options.allowTruthyFalsy && typeof value === 'number') {
    if (value === 1) {
      record.set(fieldName, true)
      return
    }
    if (value === 0) {
      record.set(fieldName, false)
      return
    }
  }

  if (options.convertNonBoolean) {
    const boolValue = Boolean(value)
    record.set(fieldName, boolValue)
    return
  }

  if (options.defaultValue !== undefined) {
    record.set(fieldName, options.defaultValue)
    return
  }

  record.addError(
    fieldName,
    options.errorMessages?.invalidBoolean || 'Invalid boolean value'
  )
}
