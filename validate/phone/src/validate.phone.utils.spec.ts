import { describe, expect, it } from 'vitest'
import { formatPhoneNumber } from './validate.phone.utils'

describe('formatPhoneNumber', () => {
  it('should format a valid US phone number', () => {
    const result = formatPhoneNumber('2125551234', 'US', 'NATIONAL')
    expect(result).toEqual({
      formattedPhone: '(212) 555-1234',
      error: null,
    })
  })

  it('should format a valid UK phone number', () => {
    const result = formatPhoneNumber('2071234567', 'GB', 'INTERNATIONAL')
    expect(result).toEqual({
      formattedPhone: '+44 20 7123 4567',
      error: null,
    })
  })

  it('should return an error for an invalid phone number', () => {
    const result = formatPhoneNumber('1234', 'US', 'NATIONAL')
    expect(result).toEqual({
      formattedPhone: '1234',
      error: 'Invalid phone number format for US',
    })
  })

  it('should handle different number formats', () => {
    const result = formatPhoneNumber('2125551234', 'US', 'E.164')
    expect(result).toEqual({
      formattedPhone: '+12125551234',
      error: null,
    })
  })

  it('should handle format options with a valid fromCountry', () => {
    const result = formatPhoneNumber('2125551234', 'US', 'INTERNATIONAL', {
      fromCountry: 'GB',
    })
    expect(result).toEqual({
      formattedPhone: '+1 212 555 1234',
      error: null,
    })
  })

  it('should return an error for an invalid country code', () => {
    const result = formatPhoneNumber('2125551234', 'XX', 'NATIONAL')
    expect(result).toEqual({
      formattedPhone: '2125551234',
      error: 'Invalid phone number format for XX',
    })
  })
})
