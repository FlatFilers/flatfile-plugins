import fetch from 'cross-fetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  calculateExchangeRate,
  convertCurrency,
  fetchExchangeRates,
  validateAmount,
  validateDate,
} from './convert.currency.plugin'

vi.mock('cross-fetch')

describe('Currency Converter Plugin Utility Functions', () => {
  describe('validateAmount', () => {
    it('should return a valid number for correct input', () => {
      expect(validateAmount(100)).toEqual({ value: 100 })
      expect(validateAmount('100')).toEqual({ value: 100 })
    })

    it('should return an error for invalid input', () => {
      expect(validateAmount('')).toEqual({ error: 'Amount is required' })
      expect(validateAmount('abc')).toEqual({
        error: 'Amount must be a valid number',
      })
    })
  })

  describe('validateDate', () => {
    it('should return a valid date for correct input', () => {
      expect(validateDate('2023-05-01')).toEqual({ value: '2023-05-01' })
    })

    it("should return today's date if no date is provided", () => {
      const today = new Date().toISOString().split('T')[0]
      expect(validateDate('')).toEqual({ value: today })
    })

    it('should return an error for invalid date format', () => {
      expect(validateDate('05-01-2023')).toEqual({
        error: 'Invalid date format. Use YYYY-MM-DD',
      })
    })
  })

  describe('convertCurrency', () => {
    it('should correctly convert currency', () => {
      expect(convertCurrency(100, 1, 0.85)).toBeCloseTo(85, 4)
      expect(convertCurrency(100, 0.75, 0.85)).toBeCloseTo(113.3333, 4)
    })
  })

  describe('calculateExchangeRate', () => {
    it('should correctly calculate exchange rate', () => {
      expect(calculateExchangeRate(1, 0.85)).toBeCloseTo(0.85, 6)
      expect(calculateExchangeRate(0.75, 0.85)).toBeCloseTo(1.133333, 6)
    })
  })

  describe('fetchExchangeRates', () => {
    const mockApiKey = 'test-api-key'
    const mockSourceCurrency = 'USD'
    const mockTargetCurrency = 'EUR'

    beforeEach(() => {
      vi.mocked(fetch).mockClear()
    })

    it('should fetch latest exchange rates when no date is provided', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          rates: { USD: 1, EUR: 0.85 },
          base: 'USD',
          timestamp: 1620000000,
        }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await fetchExchangeRates(
        mockApiKey,
        mockSourceCurrency,
        mockTargetCurrency
      )

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('latest.json'))
      expect(result).toEqual({
        rates: { USD: 1, EUR: 0.85 },
        base: 'USD',
        timestamp: 1620000000,
      })
    })

    it('should fetch historical exchange rates when a date is provided', async () => {
      const mockDate = '2023-05-01'
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          rates: { USD: 1, EUR: 0.83 },
          base: 'USD',
          timestamp: 1682899200,
        }),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await fetchExchangeRates(
        mockApiKey,
        mockSourceCurrency,
        mockTargetCurrency,
        mockDate
      )

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('historical/2023-05-01.json')
      )
      expect(result).toEqual({
        rates: { USD: 1, EUR: 0.83 },
        base: 'USD',
        timestamp: 1682899200,
      })
    })

    it('should throw an error when the API request fails', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await expect(
        fetchExchangeRates(mockApiKey, mockSourceCurrency, mockTargetCurrency)
      ).rejects.toThrow('Status: 400 Message: Bad Request')
    })
  })
})
