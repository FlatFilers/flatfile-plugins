import { recordHook } from '@flatfile/plugin-record-hook'
import { FlatfileListener } from '@flatfile/listener'
import axios from 'axios'

const BASE_URL = 'https://openexchangerates.org/api'

interface ExchangeRateResponse {
  rates: { [key: string]: number }
  base: string
  timestamp: number
}

interface CurrencyConverterConfig {
  apiKey: string
  sheetSlug: string
  sourceCurrency: string
  targetCurrency: string
  amountField: string
  dateField?: string
  convertedAmountField: string
  exchangeRateField?: string
  conversionDateField?: string
  autoConvert: boolean
}

function validateConfig(config: CurrencyConverterConfig): void {
  if (!config.apiKey) throw new Error('API key is required')
  if (!config.sheetSlug) throw new Error('Sheet slug is required')
  if (!config.sourceCurrency) throw new Error('Source currency is required')
  if (!config.targetCurrency) throw new Error('Target currency is required')
  if (!config.amountField) throw new Error('Amount field is required')
  if (!config.convertedAmountField)
    throw new Error('Converted amount field is required')
}

export default function currencyConverterPlugin(
  config: CurrencyConverterConfig
) {
  validateConfig(config)

  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug, async (record, event) => {
        if (!config.autoConvert) return record

        const amount = record.get(config.amountField) as number
        const date = config.dateField
          ? (record.get(config.dateField) as string)
          : undefined

        if (!amount) {
          record.addError(config.amountField, 'Amount is required')
          return record
        }

        if (isNaN(amount)) {
          record.addError(config.amountField, 'Amount must be a valid number')
          return record
        }

        try {
          let apiUrl = `${BASE_URL}/latest.json`
          let params: any = {
            app_id: config.apiKey,
            base: 'USD',
            symbols: `${config.sourceCurrency},${config.targetCurrency}`,
          }

          if (date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              record.addError(
                config.dateField!,
                'Invalid date format. Use YYYY-MM-DD'
              )
              return record
            }
            apiUrl = `${BASE_URL}/historical/${date}.json`
          }

          const response = await axios.get<ExchangeRateResponse>(apiUrl, {
            params,
          })

          const usdToSourceRate = response.data.rates[config.sourceCurrency]
          const usdToTargetRate = response.data.rates[config.targetCurrency]

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
            const convertedAmount = (amount / usdToSourceRate) * usdToTargetRate
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
                new Date(response.data.timestamp * 1000).toISOString()
              )
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              if (error.response.status === 401) {
                record.addError('general', 'Invalid API key')
              } else if (error.response.status === 429) {
                record.addError('general', 'API rate limit exceeded')
              } else {
                record.addError(
                  'general',
                  `API Error: ${
                    error.response.data.description || error.message
                  }`
                )
              }
            } else if (error.request) {
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
      })
    )
  }
}
