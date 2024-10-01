import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import * as chrono from 'chrono-node'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

export interface DateFormatNormalizerConfig {
  sheetSlug?: string
  dateFields: string[]
  outputFormat: string
  includeTime: boolean
  locale?: string
}

function normalizeDate(
  dateString: string,
  config: DateFormatNormalizerConfig
): string | null {
  try {
    const parsedDate = chrono.parseDate(dateString)
    if (parsedDate) {
      const formattedDate = format(parsedDate, config.outputFormat, {
        locale:  enUS,
      })

      if (!config.includeTime) {
        // If time should not be included, truncate the formatted date to just the date part
        return formattedDate.split(' ')[0]
      }

      return formattedDate
    }
    return null
  } catch (error) {
    console.error(error)
    return null
  }
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

export default validateDate
