import { recordHook } from '@flatfile/plugin-record-hook'
import * as moment from 'moment'

interface DateFormatPluginConfig {
  sheetSlug: string
  dateFields: string[]
  autoConvert: boolean
}

function convertToISO8601(dateString: string): string | null {
  const formats = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DD',
    'MMMM D, YYYY',
    'D MMMM YYYY',
    'MMM D, YYYY',
    'D MMM YYYY',
    'MM-DD-YYYY',
    'DD-MM-YYYY',
    'YYYY/MM/DD',
    'YYYY.MM.DD',
    'DD.MM.YYYY',
    'MM.DD.YYYY',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DDTHH:mm:ss',
    'YYYY-MM-DDTHH:mm:ss.SSSZ',
  ]

  for (const format of formats) {
    const date = moment(dateString, format, true)
    if (date.isValid()) {
      return date.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    }
  }

  return null
}

export default function dateNormalizationPlugin(
  config: DateFormatPluginConfig
) {
  return recordHook(config.sheetSlug, (record) => {
    for (const field of config.dateFields) {
      const dateValue = record.get(field) as string
      if (dateValue) {
        try {
          const isoDate = convertToISO8601(dateValue)
          if (isoDate) {
            if (config.autoConvert) {
              record.set(field, isoDate)
            } else {
              record.addError(field, isoDate) // TODO: What is the desired behavior here?
            }
          } else {
            throw new Error('Unsupported date format')
          }
        } catch (error) {
          if (error instanceof Error) {
            record.addError(field, `Error parsing date: ${error.message}`)
          } else {
            record.addError(
              field,
              'Unexpected error occurred while parsing date'
            )
          }
        }
      }
    }
    return record
  })
}
