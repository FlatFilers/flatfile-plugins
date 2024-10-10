import axios from 'axios';
import { performGeocoding } from './enrich.geocode.plugin';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('performGeocoding', () => {
  const apiKey = 'test_api_key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should perform forward geocoding successfully', async () => {
    const mockResponse = {
      data: {
        status: 'OK',
        results: [
          {
            geometry: {
              location: { lat: 40.7128, lng: -74.0060 },
            },
            formatted_address: 'New York, NY, USA',
            address_components: [
              { types: ['country'], long_name: 'United States' },
              { types: ['postal_code'], long_name: '10001' },
            ],
          },
        ],
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await performGeocoding({ address: 'New York' }, apiKey);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: 'New York',
          key: apiKey,
        },
      }
    );
    expect(result).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
      formatted_address: 'New York, NY, USA',
      country: 'United States',
      postal_code: '10001',
    });
  });

  it('should perform reverse geocoding successfully', async () => {
    const mockResponse = {
      data: {
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
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await performGeocoding({ latitude: 48.8584, longitude: 2.2945 }, apiKey);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: '48.8584,2.2945',
          key: apiKey,
        },
      }
    );
    expect(result).toEqual({
      latitude: 48.8584,
      longitude: 2.2945,
      formatted_address: 'Eiffel Tower, Paris, France',
      country: 'France',
      postal_code: '75007',
    });
  });

  it('should handle zero results', async () => {
    const mockResponse = {
      data: {
        status: 'ZERO_RESULTS',
        results: [],
      },
    };
    mockedAxios.get.mockResolvedValue(mockResponse);

    const result = await performGeocoding({ address: 'NonexistentPlace' }, apiKey);

    expect(result).toEqual({
      message: 'No results found for the given input',
      field: 'address',
    });
  });

  it('should handle API errors', async () => {
    mockedAxios.get.mockRejectedValue({
      response: {
        status: 400,
        data: { error_message: 'Invalid request' },
      },
    });

    const result = await performGeocoding({ address: 'New York' }, apiKey);

    expect(result).toEqual({
      message: 'API error: 400 - Invalid request',
      field: 'address',
    });
  });

  it('should handle unexpected errors', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    const result = await performGeocoding({ address: 'New York' }, apiKey);

    expect(result).toEqual({
      message: 'An unexpected error occurred while geocoding',
      field: 'address',
    });
  });

  it('should return an error when neither address nor coordinates are provided', async () => {
    const result = await performGeocoding({}, apiKey);

    expect(result).toEqual({
      message: 'Either address or both latitude and longitude are required',
      field: 'input',
    });
  });
});
