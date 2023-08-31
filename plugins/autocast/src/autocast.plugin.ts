import api from '@flatfile/api'
import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { BulkRecordHook } from '@flatfile/plugin-record-hook'
import { FlatfileRecord, TPrimitive } from '@flatfile/hooks'

export function autocast(
  sheetId: string,
  options?: {
    chunkSize?: number
    parallel?: number
  }
) {
  return async (client: FlatfileListener) => {
    client.on('commit:created', { sheetId }, async (event: FlatfileEvent) => {
      return BulkRecordHook(event, callback, options)
    })
  }
}

async function callback(records: FlatfileRecord[], event: FlatfileEvent) {
  const { sheetId } = event.context
  const sheet = await api.sheets.get(sheetId)
  if (!sheet) {
    console.log(`Failed to fetch sheet with id: ${sheetId}`)
    return
  }

  const castableFields = sheet.data.config.fields.filter(
    (field) => field.type !== 'string'
  )

  records.forEach((record) => {
    castableFields.forEach((field) => {
      const originalValue = record.get(field.key)
      const caster = CASTING_FUNCTIONS[field.type]

      if (originalValue && caster && typeof originalValue !== field.type) {
        record.computeIfPresent(field.key, caster)

        if (originalValue === record.get(field.key)) {
          record.addError(
            field.key,
            `Failed to cast '${originalValue}' to '${field.type}'`
          )
        }
      }
    })
  })
}

const CASTING_FUNCTIONS: {
  [key: string]: (value: TPrimitive) => TPrimitive
} = {
  number: castNumber,
  boolean: castBoolean,
  date: castDate,
}

export function castNumber(value: TPrimitive): TPrimitive {
  if (typeof value === 'string') {
    const strippedValue = value.replace(/,/g, '')
    if (!isNaN(Number(strippedValue))) {
      const num = Number(strippedValue)
      if (isFinite(num)) {
        return num
      }
    }
  }
  return value
}

export const TRUTHY_VALUES = ['1', 'yes', 'true', 'on', 't', 'y', 1]
export const FALSY_VALUES = ['-1', '0', 'no', 'false', 'off', 'f', 'n', 0, -1]
export function castBoolean(value: TPrimitive): TPrimitive {
  if (typeof value === 'string' || typeof value === 'number') {
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
  return value
}

export function castDate(value: TPrimitive): TPrimitive {
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date.toUTCString()
    }
  }
  return value
}
