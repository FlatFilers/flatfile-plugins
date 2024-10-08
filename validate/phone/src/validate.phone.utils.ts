import {
  parsePhoneNumber,
  isValidPhoneNumber,
  CountryCode,
  NumberFormat,
  FormatNumberOptions,
} from 'libphonenumber-js'

export function formatPhoneNumber(
  phone: string,
  country: string,
  format: NumberFormat,
  formatOptions?: FormatNumberOptions
): { formattedPhone: string; error: string | null } {
  try {
    const countryCode = country as CountryCode

    if (!isValidPhoneNumber(phone, countryCode)) {
      console.log(`invalid phone number: ${phone}`)
      return {
        formattedPhone: phone,
        error: `Invalid phone number format for ${country}`,
      }
    }

    const phoneNumber = parsePhoneNumber(phone, countryCode)
    const formattedPhone = phoneNumber.format(format, formatOptions)
    return { formattedPhone, error: null }
  } catch (error) {
    return {
      formattedPhone: phone,
      error: 'Error processing phone number',
    }
  }
}
