import { FlatfileClient } from '@flatfile/api'
import type { TRecordValue } from '@flatfile/hooks'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { FlatfileRecord } from '@flatfile/plugin-record-hook'
import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import { logInfo } from '@flatfile/util-common'

const api = new FlatfileClient()

export function autocast(
  sheetSlug: string,
  fieldFilters?: string[],
  options?: {
    chunkSize?: number
    parallel?: number
    debug?: boolean
  }
) {
  return (listener: FlatfileListener) => {
    listener.use(
      bulkRecordHook(
        sheetSlug,
        async (records: FlatfileRecord[], event?: FlatfileEvent) => {
          const { sheetId } = event?.context
          const sheet = await api.sheets.get(sheetId)
          if (!sheet) {
            logInfo('@flatfile/plugin-autocast', 'Failed to fetch sheet')
            return
          }

          const castableFields = sheet.data.config.fields.filter((field) =>
            fieldFilters
              ? fieldFilters.includes(field.key)
              : field.type !== 'string'
          )
          records.forEach((record) => {
            castableFields.forEach((field) => {
              const originalValue = record.get(field.key)
              const caster = CASTING_FUNCTIONS[field.type]

              if (
                originalValue &&
                caster &&
                typeof originalValue !== field.type
              ) {
                try {
                  record.computeIfPresent(field.key, caster)
                } catch (e) {
                  record.addError(
                    field.key,
                    (e as Error).message || 'Failed to cast value'
                  )
                }
              }
            })
          })
        },
        options
      )
    )
  }
}

const CASTING_FUNCTIONS: {
  [key: string]: (value: TRecordValue) => TRecordValue
} = {
  string: castString,
  number: castNumber,
  boolean: castBoolean,
  date: castDate,
}

export function castString(value: TRecordValue): TRecordValue {
  if (typeof value === 'string') {
    return value
  } else if (typeof value === 'number') {
    return value.toString()
  } else if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  throw new Error(`Failed to cast '${value}' to 'string'`)
}

export function castNumber(value: TRecordValue): TRecordValue {
  if (typeof value === 'number') {
    return value
  } else if (typeof value === 'string') {
    const strippedValue = value.replace(/,/g, '')
    if (!isNaN(Number(strippedValue))) {
      const num = Number(strippedValue)
      if (isFinite(num)) {
        return num
      }
    }
  }
  throw new Error('Invalid number')
}

export const TRUTHY_VALUES = ['1', 'yes', 'true', 'on', 't', 'y', 1]
export const FALSY_VALUES = ['-1', '0', 'no', 'false', 'off', 'f', 'n', 0, -1]
export function castBoolean(value: TRecordValue): TRecordValue {
  if (typeof value === 'boolean') {
    return value
  } else if (typeof value === 'string' || typeof value === 'number') {
    if (value === '') {
      return null
    }
    const normValue = typeof value === 'string' ? value.toLowerCase() : value
    if (TRUTHY_VALUES.includes(normValue)) {
      return true
    }
    if (FALSY_VALUES.includes(normValue)) {
      return false
    }
  }
  throw new Error('Invalid boolean')
}

export function castDate(value: TRecordValue): TRecordValue {
  // Check if value is a number and if so use the numeric value instead of a string
  const numericTimestamp = Number(value)
  let finalValue = !isNaN(numericTimestamp) ? numericTimestamp : value

  if (typeof finalValue === 'string' || typeof finalValue === 'number') {
    const date = new Date(finalValue)
    if (!isNaN(date.getTime())) {
      return date.toUTCString()
    }
  }
  throw new Error('Invalid date')
}
