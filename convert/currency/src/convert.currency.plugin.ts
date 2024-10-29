import { type FlatfileEvent, type FlatfileListener } from '@flatfile/listener'
import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import fetch from 'cross-fetch'

const BASE_URL = 'https://openexchangerates.org/api'

interface ExchangeRateResponse {
  rates: { [key: string]: number }
  base: string
  timestamp: number
}

interface CurrencyConverterConfig {
  sheetSlug: string
  sourceCurrency: string
  targetCurrency: string
  amountField: string
  dateField?: string
  convertedAmountField: string
  exchangeRateField?: string
  conversionDateField?: string
}

function validateConfig(config: CurrencyConverterConfig): void {
  if (!config.sheetSlug) throw new Error('Sheet slug is required')
  if (!config.sourceCurrency) throw new Error('Source currency is required')
  if (!config.targetCurrency) throw new Error('Target currency is required')
  if (!config.amountField) throw new Error('Amount field is required')
  if (!config.convertedAmountField)
    throw new Error('Converted amount field is required')
}

export function validateAmount(
  amount: any
): { value: number } | { error: string } {
  if (!amount) {
    return { error: 'Amount is required' }
  }
  if (isNaN(amount)) {
    return { error: 'Amount must be a valid number' }
  }
  return { value: Number(amount) }
}

export function validateDate(
  date: string
): { value: string } | { error: string } {
  if (!date) {
    return { value: new Date().toISOString().split('T')[0] }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: 'Invalid date format. Use YYYY-MM-DD' }
  }
  return { value: date }
}

export async function fetchExchangeRates(
  apiKey: string,
  sourceCurrency: string,
  targetCurrency: string,
  date?: string
): Promise<ExchangeRateResponse> {
  let apiUrl = `${BASE_URL}/latest.json`
  let params: any = {
    app_id: apiKey,
    base: 'USD',
    symbols: `${sourceCurrency},${targetCurrency}`,
  }

  if (date) {
    apiUrl = `${BASE_URL}/historical/${date}.json`
  }

  const queryString = new URLSearchParams(params).toString()
  const fullUrl = `${apiUrl}?${queryString}`
  console.log(`Fetching exchange rates from ${fullUrl}`)

  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(
      `Status: ${response.status} Message: ${response.statusText}`
    )
  }
  return (await response.json()) as ExchangeRateResponse
}

export function convertCurrency(
  amount: number,
  usdToSourceRate: number,
  usdToTargetRate: number
): number {
  return Number(((amount / usdToSourceRate) * usdToTargetRate).toFixed(4))
}

export function calculateExchangeRate(
  usdToSourceRate: number,
  usdToTargetRate: number
): number {
  return Number((usdToTargetRate / usdToSourceRate).toFixed(6))
}

export function currencyConverterPlugin(config: CurrencyConverterConfig) {
  validateConfig(config)

  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(
        config.sheetSlug,
        async (record: FlatfileRecord, event: FlatfileEvent) => {
          const apiKey = await event.secrets('OPENEXCHANGERATES_API_KEY')
          const amountResult = validateAmount(record.get(config.amountField))

          if ('error' in amountResult) {
            record.addError(config.amountField, amountResult.error)
            return record
          }

          const amount = amountResult.value

          let date: string
          if (config.dateField) {
            const dateResult = validateDate(
              record.get(config.dateField) as string
            )
            if ('error' in dateResult) {
              record.addError(config.dateField, dateResult.error)
              return record
            }
            date = dateResult.value
          } else {
            date = new Date().toISOString().split('T')[0]
          }

          try {
            const data = await fetchExchangeRates(
              apiKey,
              config.sourceCurrency,
              config.targetCurrency,
              date
            )

            const usdToSourceRate = data.rates[config.sourceCurrency]
            const usdToTargetRate = data.rates[config.targetCurrency]

            if (!usdToSourceRate) {
              record.addError(
                'currency',
                `Invalid source currency: ${config.sourceCurrency}`
              )
            }
            if (!usdToTargetRate) {
              record.addError(
                'currency',
                `Invalid target currency: ${config.targetCurrency}`
              )
            }

            if (usdToSourceRate && usdToTargetRate) {
              const convertedAmount = convertCurrency(
                amount,
                usdToSourceRate,
                usdToTargetRate
              )
              record.set(config.convertedAmountField, convertedAmount)

              if (config.exchangeRateField) {
                const exchangeRate = calculateExchangeRate(
                  usdToSourceRate,
                  usdToTargetRate
                )
                record.set(config.exchangeRateField, exchangeRate)
              }

              if (config.conversionDateField) {
                record.set(
                  config.conversionDateField,
                  new Date(data.timestamp * 1000).toISOString()
                )
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              if (error.message.includes('API Error')) {
                record.addError('general', error.message)
              } else if (error.message.includes('Failed to fetch')) {
                record.addError(
                  'general',
                  'Network error: Unable to reach the API'
                )
              } else {
                record.addError('general', `Error: ${error.message}`)
              }
            } else {
              record.addError('general', 'An unexpected error occurred')
            }
          }

          return record
        }
      )
    )
  }
}
