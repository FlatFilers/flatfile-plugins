import fetch from 'cross-fetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { performGeocoding } from './enrich.geocode.plugin'

vi.mock('cross-fetch')

describe('performGeocoding', () => {
  const apiKey = 'test_api_key'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should perform forward geocoding successfully', async () => {
    const mockResponse = {
      status: 'OK',
      results: [
        {
          geometry: {
            location: { lat: 40.7128, lng: -74.006 },
          },
          formatted_address: 'New York, NY, USA',
          address_components: [
            { types: ['country'], long_name: 'United States' },
            { types: ['postal_code'], long_name: '10001' },
          ],
        },
      ],
    }
    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    } as any)

    const result = await performGeocoding({ address: 'New York' }, apiKey)

    expect(fetch).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/geocode/json?key=test_api_key&address=New+York'
    )
    expect(result).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
      formatted_address: 'New York, NY, USA',
      country: 'United States',
      postal_code: '10001',
    })
  })

  it('should perform reverse geocoding successfully', async () => {
    const mockResponse = {
      status: 'OK',
      results: [
        {
          geometry: {
            location: { lat: 48.8584, lng: 2.2945 },
          },
          formatted_address: 'Eiffel Tower, Paris, France',
          address_components: [
            { types: ['country'], long_name: 'France' },
            { types: ['postal_code'], long_name: '75007' },
          ],
        },
      ],
    }
    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    } as any)

    const result = await performGeocoding(
      { latitude: 48.8584, longitude: 2.2945 },
      apiKey
    )

    expect(fetch).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/geocode/json?key=test_api_key&latlng=48.8584%2C2.2945'
    )
    expect(result).toEqual({
      latitude: 48.8584,
      longitude: 2.2945,
      formatted_address: 'Eiffel Tower, Paris, France',
      country: 'France',
      postal_code: '75007',
    })
  })

  it('should handle zero results', async () => {
    const mockResponse = {
      status: 'ZERO_RESULTS',
      results: [],
    }
    vi.mocked(fetch).mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockResponse),
    } as any)

    const result = await performGeocoding(
      { address: 'NonexistentPlace' },
      apiKey
    )

    expect(result).toEqual({
      message: 'No results found for the given input',
      field: 'address',
    })
  })

  it('should handle API errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('API error'))

    const result = await performGeocoding({ address: 'New York' }, apiKey)

    expect(result).toEqual({
      message: 'API error: API error',
      field: 'address',
    })
  })

  it('should handle unexpected errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    const result = await performGeocoding({ address: 'New York' }, apiKey)

    expect(result).toEqual({
      message: 'API error: Network error',
      field: 'address',
    })
  })

  it('should return an error when neither address nor coordinates are provided', async () => {
    const result = await performGeocoding({}, apiKey)

    expect(result).toEqual({
      message: 'Either address or both latitude and longitude are required',
      field: 'input',
    })
  })
})
