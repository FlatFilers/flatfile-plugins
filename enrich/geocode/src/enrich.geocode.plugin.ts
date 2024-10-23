import type { FlatfileEvent } from '@flatfile/listener'
import type { FlatfileRecord } from '@flatfile/plugin-record-hook'

import { bulkRecordHook } from '@flatfile/plugin-record-hook'
import fetch from 'cross-fetch'

interface GeocodingConfig {
  sheetSlug: string
  addressField: string
  latitudeField: string
  longitudeField: string
  autoGeocode: boolean
}

interface GeocodingResult {
  latitude: number
  longitude: number
  formatted_address: string
  country?: string
  postal_code?: string
}

interface GeocodingError {
  message: string
  field: string
}

export async function performGeocoding(
  input: { address?: string; latitude?: number; longitude?: number },
  apiKey: string
): Promise<GeocodingResult | GeocodingError> {
  try {
    let response
    let url = 'https://maps.googleapis.com/maps/api/geocode/json'
    let params: Record<string, string> = { key: apiKey }

    if (input.address) {
      // Forward geocoding
      params.address = input.address
    } else if (input.latitude && input.longitude) {
      // Reverse geocoding
      params.latlng = `${input.latitude},${input.longitude}`
    } else {
      return {
        message: 'Either address or both latitude and longitude are required',
        field: 'input',
      }
    }

    const queryString = new URLSearchParams(params).toString()
    response = await fetch(`${url}?${queryString}`)
    const data = await response.json()

    if (data.status === 'OK') {
      const result = data.results[0]
      const { lat, lng } = result.geometry.location
      const geocodingResult: GeocodingResult = {
        latitude: lat,
        longitude: lng,
        formatted_address: result.formatted_address,
      }

      // Extract additional components
      for (const component of result.address_components) {
        if (component.types.includes('country')) {
          geocodingResult.country = component.long_name
        }
        if (component.types.includes('postal_code')) {
          geocodingResult.postal_code = component.long_name
        }
      }

      return geocodingResult
    } else if (data.status === 'ZERO_RESULTS') {
      return {
        message: 'No results found for the given input',
        field: input.address ? 'address' : 'coordinates',
      }
    } else {
      return {
        message: `Geocoding failed: ${data.status}`,
        field: input.address ? 'address' : 'coordinates',
      }
    }
  } catch (error) {
    console.error('Error calling Google Maps Geocoding API:', error)
    if (error instanceof Error) {
      return {
        message: `API error: ${error.message}`,
        field: input.address ? 'address' : 'coordinates',
      }
    } else {
      return {
        message: 'An unexpected error occurred while geocoding',
        field: input.address ? 'address' : 'coordinates',
      }
    }
  }
}

export function enrichGeocode(config: GeocodingConfig) {
  return bulkRecordHook(
    config.sheetSlug,
    async (records: FlatfileRecord[], event: FlatfileEvent) => {
      const googleMapsApiKey =
        process.env.GOOGLE_MAPS_API_KEY ||
        (await event.secrets('GOOGLE_MAPS_API_KEY'))
      for (const record of records) {
        const address = record.get(config.addressField) as string
        const latitude = record.get(config.latitudeField) as number
        const longitude = record.get(config.longitudeField) as number

        if (!config.autoGeocode) {
          return record
        }

        const result = await performGeocoding(
          { address, latitude, longitude },
          googleMapsApiKey
        )

        if ('message' in result) {
          record.addError(result.field, result.message)
        } else {
          record.set(config.latitudeField, result.latitude)
          record.set(config.longitudeField, result.longitude)
          record.set('formatted_address', result.formatted_address)
          if (result.country) record.set('country', result.country)
          if (result.postal_code) record.set('postal_code', result.postal_code)
        }
      }
      return records
    }
  )
}

export default enrichGeocode
