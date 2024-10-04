import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { formatPhoneNumber } from './validate.phone.utils'

export interface PhoneFormatPluginConfig {
  sheetSlug?: string
  phoneField: string
  countryField: string
  autoConvert?: boolean
  concurrency?: number
  debug?: boolean
}

export function validatePhone(config: PhoneFormatPluginConfig) {
  return recordHook(
    config.sheetSlug || '**',
    (record: FlatfileRecord) => {
      const phone = record.get(config.phoneField) as string
      const country = record.get(config.countryField) as string

      if (!phone) {
        record.addError(config.phoneField, 'Phone number is required')
        return record
      }

      if (!country) {
        record.addError(
          config.countryField,
          'Country is required for phone number formatting'
        )
        return record
      }

      const { formattedPhone, error } = formatPhoneNumber(phone, country)

      if (error) {
        record.addError(config.phoneField, error)
      } else if (formattedPhone !== phone && config.autoConvert) {
        record.set(config.phoneField, formattedPhone)
      }

      return record
    },
    {
      concurrency: config.concurrency,
      debug: config.debug,
    }
  )
}

export default validatePhone
