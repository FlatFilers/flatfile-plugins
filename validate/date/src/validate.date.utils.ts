import * as chrono from 'chrono-node'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { DateFormatNormalizerConfig } from './validate.date.plugin'

export function normalizeDate(
  dateString: string,
  config: DateFormatNormalizerConfig
): string | null {
  try {
    const parsedDate = chrono.parseDate(dateString)
    if (parsedDate) {
      const formattedDate = format(parsedDate, config.outputFormat, {
        locale: enUS,
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
