/* 
  Task: Develop a Flatfile Listener plugin for phone number formatting:
      - Use a RecordHook to process phone number fields
      - Implement regex patterns to identify various phone number formats
      - Normalize phone numbers to a consistent format (e.g., +1 (123) 456-7890)
      - Handle international phone numbers with country codes
      - Add error messages for invalid phone number structures
      - Give the user reasonable config options to specify the Sheet Slug, the Field(s) that are the phone number(s), whether the conversion should be done automatically
  _____________________________
  Summary: This code implements a Flatfile Listener plugin for phone number formatting with configurable options. It uses the RecordHook to process individual records, format phone numbers based on country, and handle errors. The plugin is customizable with options for sheet slug, field names, and automatic conversion.
*/

import type { FlatfileEvent } from '@flatfile/listener'
import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'

export interface PhoneFormatPluginConfig {
  sheetSlug?: string
  phoneField: string
  countryField: string
  autoConvert?: boolean
  concurrency?: number
  debug?: boolean
}

const phonePatterns = {
  US: /^(\+1|1)?[\s-]?\(?[2-9]\d{2}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  UK: /^(\+44|0)?\s?\d{3,5}\s?\d{3,4}\s?\d{3,4}$/,
  India: /^(\+91|0)?[6789]\d{9}$/,
  Germany: /^(\+49|0)[1-9]\d{1,14}$/,
  France: /^(\+33|0)[1-9](\d{2}){4}$/,
  Brazil: /^(\+55|0)?([1-9]{2})?([1-9]{4,5})(\d{4})$/,
}

function formatPhoneNumber(
  phone: string,
  country: string
): { formattedPhone: string; error: string | null } {
  const pattern = phonePatterns[country]
  if (!pattern) {
    return {
      formattedPhone: phone,
      error: `Unsupported country code: ${country}`,
    }
  }

  const digitsOnly = phone.replace(/\D/g, '')

  if (pattern.test(phone)) {
    let formattedPhone: string

    switch (country) {
      case 'US':
        formattedPhone = digitsOnly.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '($1) $2-$3'
        )
        break
      case 'UK':
        formattedPhone = digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
        break
      case 'India':
        formattedPhone = digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
        break
      case 'Germany':
        formattedPhone = digitsOnly.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
        break
      case 'France':
        formattedPhone = digitsOnly.replace(
          /(\d{2})(\d{2})(\d{2})(\d{2})/,
          '$1 $2 $3 $4'
        )
        break
      case 'Brazil':
        formattedPhone = digitsOnly.replace(
          /(\d{2})(\d{4,5})(\d{4})/,
          '($1) $2-$3'
        )
        break
      default:
        formattedPhone = phone
    }

    return { formattedPhone, error: null }
  } else {
    return {
      formattedPhone: phone,
      error: `Invalid phone number format for ${country}`,
    }
  }
}

export function phoneFormatValidator(config: PhoneFormatPluginConfig) {
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
