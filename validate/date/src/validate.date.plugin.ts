import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { normalizeDate } from './validate.date.utils'

export interface DateFormatNormalizerConfig {
  sheetSlug?: string
  dateFields: string[]
  outputFormat: string
  includeTime: boolean
  locale?: string
}

export function validateDate(config: DateFormatNormalizerConfig) {
  return recordHook(
    config.sheetSlug || '**',
    (record: FlatfileRecord, event: FlatfileEvent) => {
      config.dateFields.forEach((field) => {
        const dateValue = record.get(field) as string
        if (dateValue) {
          const normalizedDate = normalizeDate(dateValue, config)
          if (normalizedDate) {
            record.set(field, normalizedDate)
          } else {
            record.addError(field, 'Unable to parse date string')
          }
        }
      })
      return record
    }
  )
}
