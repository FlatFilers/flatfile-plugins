import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import axios from 'axios'

interface GeocodingConfig {
  sheetSlug: string
  addressField: string
  latitudeField: string
  longitudeField: string
  autoGeocode: boolean
  apiKey: string
}

const defaultConfig: GeocodingConfig = {
  sheetSlug: 'addresses',
  addressField: 'address',
  latitudeField: 'latitude',
  longitudeField: 'longitude',
  autoGeocode: true,
  apiKey: 'YOUR_API_KEY_HERE',
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
    if (input.address) {
      // Forward geocoding
      response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: input.address,
            key: apiKey,
          },
        }
      )
    } else if (input.latitude && input.longitude) {
      // Reverse geocoding
      response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            latlng: `${input.latitude},${input.longitude}`,
            key: apiKey,
          },
        }
      )
    } else {
      return {
        message: 'Either address or both latitude and longitude are required',
        field: 'input',
      }
    }

    if (response.data.status === 'OK') {
      const result = response.data.results[0]
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
    } else if (response.data.status === 'ZERO_RESULTS') {
      return {
        message: 'No results found for the given input',
        field: input.address ? 'address' : 'coordinates',
      }
    } else {
      return {
        message: `Geocoding failed: ${response.data.status}`,
        field: input.address ? 'address' : 'coordinates',
      }
    }
  } catch (error) {
    // console.error('Error calling Google Maps Geocoding API:', error)
    if (axios.isAxiosError(error) && error.response) {
      return {
        message: `API error: ${error.response.status} - ${
          error.response.data.error_message || 'Unknown error'
        }`,
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

export function enrichGeocode(
  listener: FlatfileListener,
  userConfig: Partial<GeocodingConfig> = {}
) {
  const config: GeocodingConfig = { ...defaultConfig, ...userConfig }

  listener.use(
    recordHook(config.sheetSlug, async (record, event) => {
      const address = record.get(config.addressField) as string
      const latitude = record.get(config.latitudeField) as number
      const longitude = record.get(config.longitudeField) as number

      if (!config.autoGeocode) {
        return record
      }

      const result = await performGeocoding(
        { address, latitude, longitude },
        config.apiKey
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

      return record
    })
  )

  return listener
}

export default enrichGeocode
