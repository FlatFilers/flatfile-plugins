import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import type { FormatNumberOptions, NumberFormat } from 'libphonenumber-js'
import { formatPhoneNumber } from './validate.phone.utils'

export interface PhoneFormatPluginConfig {
  sheetSlug?: string
  phoneField: string
  countryField: string
  autoConvert?: boolean
  concurrency?: number
  debug?: boolean
  format?: NumberFormat
  formatOptions?: FormatNumberOptions
}

export function validatePhone(config: PhoneFormatPluginConfig) {
  const autoConvert = config.autoConvert !== false // Default to true if not explicitly set to false
  const format = config.format || 'NATIONAL'

  return recordHook(config.sheetSlug || '**', (record: FlatfileRecord) => {
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

    const { formattedPhone, error } = formatPhoneNumber(
      phone,
      country,
      format,
      config.formatOptions
    )

    if (error) {
      record.addError(config.phoneField, error)
    } else if (formattedPhone !== phone && autoConvert) {
      record.set(config.phoneField, formattedPhone)
    }

    return record
  })
}

export default validatePhone
