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

export function currencyConverterPlugin(config: CurrencyConverterConfig) {
  validateConfig(config)

  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(
        config.sheetSlug,
        async (record: FlatfileRecord, event: FlatfileEvent) => {
          const apiKey = await event.secrets('OPENEXCHANGERATES_API_KEY')
          const amount = record.get(config.amountField) as number
          const date = config.dateField
            ? (record.get(config.dateField) as string)
            : undefined

          if (!amount) {
            console.log('Amount is required')
            record.addError(config.amountField, 'Amount is required')
            return record
          }

          if (isNaN(amount)) {
            console.log('Amount must be a valid number')
            record.addError(config.amountField, 'Amount must be a valid number')
            return record
          }

          try {
            let apiUrl = `${BASE_URL}/latest.json`
            let params: any = {
              app_id: apiKey,
              base: 'USD',
              symbols: `${config.sourceCurrency},${config.targetCurrency}`,
            }

            if (date) {
              if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                console.log('Invalid date format. Use YYYY-MM-DD')
                record.addError(
                  config.dateField!,
                  'Invalid date format. Use YYYY-MM-DD'
                )
                return record
              }
              apiUrl = `${BASE_URL}/historical/${date}.json`
            }

            const queryString = new URLSearchParams(params).toString()
            const fullUrl = `${apiUrl}?${queryString}`
            console.log(`Fetching exchange rates from ${fullUrl}`)

            const response = await fetch(fullUrl)
            const data = (await response.json()) as ExchangeRateResponse

            if (!response.ok) {
              throw new Error(
                `Status: ${response.status} Message: ${response.statusText}`
              )
            }

            const usdToSourceRate = data.rates[config.sourceCurrency]
            const usdToTargetRate = data.rates[config.targetCurrency]

            if (!usdToSourceRate) {
              console.log(`Invalid source currency: ${config.sourceCurrency}`)
              record.addError(
                'currency',
                `Invalid source currency: ${config.sourceCurrency}`
              )
            }
            if (!usdToTargetRate) {
              console.log(`Invalid target currency: ${config.targetCurrency}`)
              record.addError(
                'currency',
                `Invalid target currency: ${config.targetCurrency}`
              )
            }

            if (usdToSourceRate && usdToTargetRate) {
              const convertedAmount =
                (amount / usdToSourceRate) * usdToTargetRate
              record.set(
                config.convertedAmountField,
                Number(convertedAmount.toFixed(4))
              )

              if (config.exchangeRateField) {
                record.set(
                  config.exchangeRateField,
                  Number((usdToTargetRate / usdToSourceRate).toFixed(6))
                )
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
                console.log(error.message)
                record.addError('general', error.message)
              } else if (error.message.includes('Failed to fetch')) {
                console.log('Network error: Unable to reach the API')
                record.addError(
                  'general',
                  'Network error: Unable to reach the API'
                )
              } else {
                console.log(`Error: ${error.message}`)
                record.addError('general', `Error: ${error.message}`)
              }
            } else {
              console.log('An unexpected error occurred')
              record.addError('general', 'An unexpected error occurred')
            }
          }

          return record
        }
      )
    )
  }
}
