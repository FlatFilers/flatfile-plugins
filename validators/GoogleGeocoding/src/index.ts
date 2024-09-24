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

export default function geocodingPlugin(
  listener: FlatfileListener,
  userConfig: Partial<GeocodingConfig> = {}
) {
  const config: GeocodingConfig = { ...defaultConfig, ...userConfig }

  listener.use(
    recordHook(config.sheetSlug, async (record, event) => {
      const address = record.get(config.addressField) as string
      const latitude = record.get(config.latitudeField) as number
      const longitude = record.get(config.longitudeField) as number

      if (!address && (!latitude || !longitude)) {
        record.addError(
          config.addressField,
          `Either ${config.addressField} or both ${config.latitudeField} and ${config.longitudeField} are required`
        )
        return record
      }

      if (!config.autoGeocode) {
        return record
      }

      try {
        let response
        if (address) {
          // Forward geocoding
          response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
              params: {
                address: address,
                key: config.apiKey,
              },
            }
          )
        } else {
          // Reverse geocoding
          response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
              params: {
                latlng: `${latitude},${longitude}`,
                key: config.apiKey,
              },
            }
          )
        }

        if (response.data.status === 'OK') {
          const result = response.data.results[0]
          const { lat, lng } = result.geometry.location

          record.set(config.latitudeField, lat)
          record.set(config.longitudeField, lng)
          record.set('formatted_address', result.formatted_address)

          // Extract additional components
          for (const component of result.address_components) {
            if (component.types.includes('country')) {
              record.set('country', component.long_name)
            }
            if (component.types.includes('postal_code')) {
              record.set('postal_code', component.long_name)
            }
          }
        } else if (response.data.status === 'ZERO_RESULTS') {
          record.addError(
            address ? config.addressField : 'coordinates',
            'No results found for the given input'
          )
        } else {
          record.addError(
            address ? config.addressField : 'coordinates',
            `Geocoding failed: ${response.data.status}`
          )
        }
      } catch (error) {
        console.error('Error calling Google Maps Geocoding API:', error)
        if (axios.isAxiosError(error) && error.response) {
          record.addError(
            address ? config.addressField : 'coordinates',
            `API error: ${error.response.status} - ${
              error.response.data.error_message || 'Unknown error'
            }`
          )
        } else {
          record.addError(
            address ? config.addressField : 'coordinates',
            'An unexpected error occurred while geocoding'
          )
        }
      }

      return record
    })
  )

  return listener
}
