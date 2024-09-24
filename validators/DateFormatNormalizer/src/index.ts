import { FlatfileListener } from '@flatfile/listener'
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
  listener: FlatfileListener,
  config: DateFormatPluginConfig
) {
  if (
    !config.sheetSlug ||
    !config.dateFields ||
    config.dateFields.length === 0
  ) {
    throw new Error(
      'Invalid configuration: sheetSlug and dateFields are required'
    )
  }

  listener.use(
    recordHook(
      config.sheetSlug,
      async (record, event) => {
        for (const field of config.dateFields) {
          const dateValue = record.get(field) as string
          if (dateValue) {
            try {
              const isoDate = convertToISO8601(dateValue)
              if (isoDate) {
                if (config.autoConvert) {
                  record.set(field, isoDate)
                } else {
                  record.computeField(field, isoDate)
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
      },
      {
        concurrency: 10,
        debug: false,
      }
    )
  )

  listener.on('**', (event) => {
    if (event.topic.includes(':error')) {
      console.error('An error occurred:', event.topic, event.payload)
    }
  })
}
