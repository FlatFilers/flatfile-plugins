import api from '@flatfile/api'
import { TPrimitive } from '@flatfile/hooks'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import {
  FlatfileRecord,
  bulkRecordHookPlugin,
} from '@flatfile/plugin-record-hook'
import { logInfo } from '@flatfile/util-common'

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
      bulkRecordHookPlugin(
        sheetSlug,
        async (records: FlatfileRecord[], event: FlatfileEvent) => {
          const sheetId = event.context.sheetId
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
                  record.computeIfPresent(
                    field.key,
                    caster,
                    `Cast '${originalValue}' from '${typeof originalValue}' to '${
                      field.type
                    }'`
                  )
                } catch (e) {
                  record.addError(
                    field.key,
                    e.message || 'Failed to cast value'
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
  [key: string]: (value: TPrimitive) => TPrimitive
} = {
  number: castNumber,
  boolean: castBoolean,
  date: castDate,
}

export function castNumber(value: TPrimitive): TPrimitive {
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
  throw new Error(`Failed to cast '${value}' to 'number'`)
}

export const TRUTHY_VALUES = ['1', 'yes', 'true', 'on', 't', 'y', 1]
export const FALSY_VALUES = ['-1', '0', 'no', 'false', 'off', 'f', 'n', 0, -1]
export function castBoolean(value: TPrimitive): TPrimitive {
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
  throw new Error(`Failed to cast '${value}' to 'boolean'`)
}

export function castDate(value: TPrimitive): TPrimitive {
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date.toUTCString()
    }
  }
  throw new Error(`Failed to cast '${value}' to 'date'`)
}
