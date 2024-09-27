import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { logInfo, logError } from '@flatfile/util-common'

interface NumberValidationConfig {
  min?: number
  max?: number
  inclusive?: boolean
  integerOnly?: boolean
  precision?: number
  scale?: number
  currency?: boolean
  step?: number
  thousandsSeparator?: string
  decimalPoint?: string
  specialTypes?: string[]
  round?: boolean
  truncate?: boolean
}

export function numberValidationPlugin(config: NumberValidationConfig) {
  return (listener: FlatfileListener) => {
    listener.use((handler) => {
      handler.on('record:created', async (event: FlatfileEvent) => {
        const { record } = event.payload
        const numberField = record.get('numberField') // Replace 'numberField' with your actual field name

        try {
          let numberValue = numberField
            .replace(config.thousandsSeparator || ',', '')
            .replace(config.decimalPoint || '.', '.')
          numberValue = parseFloat(numberValue)

          if (isNaN(numberValue)) {
            throw new Error('The field must be a number')
          }

          if (config.round) {
            numberValue = Math.round(numberValue)
          }

          if (config.truncate) {
            numberValue = Math.trunc(numberValue)
          }

          if (config.integerOnly && !Number.isInteger(numberValue)) {
            throw new Error('The field must be an integer')
          }

          if (config.min !== undefined) {
            if (
              config.inclusive
                ? numberValue < config.min
                : numberValue <= config.min
            ) {
              throw new Error(
                `The field must be greater than ${
                  config.inclusive ? 'or equal to ' : ''
                }${config.min}`
              )
            }
          }

          if (config.max !== undefined) {
            if (
              config.inclusive
                ? numberValue > config.max
                : numberValue >= config.max
            ) {
              throw new Error(
                `The field must be less than ${
                  config.inclusive ? 'or equal to ' : ''
                }${config.max}`
              )
            }
          }

          if (config.precision !== undefined && config.scale !== undefined) {
            const [integerPart, decimalPart] = numberValue.toString().split('.')
            if (integerPart.length > config.precision - config.scale) {
              throw new Error(
                `The field must have at most ${
                  config.precision - config.scale
                } digits before the decimal point`
              )
            }
            if (decimalPart && decimalPart.length > config.scale) {
              throw new Error(
                `The field must have at most ${config.scale} digits after the decimal point`
              )
            }
          }

          if (
            config.currency &&
            !/^\d+(\.\d{1,2})?$/.test(numberValue.toString())
          ) {
            throw new Error(
              'The field must be a valid currency value with at most two decimal places'
            )
          }

          if (config.step !== undefined && numberValue % config.step !== 0) {
            throw new Error(`The field must be a multiple of ${config.step}`)
          }

          if (config.specialTypes) {
            if (
              config.specialTypes.includes('prime') &&
              !isPrime(numberValue)
            ) {
              throw new Error('The field must be a prime number')
            }
            if (config.specialTypes.includes('even') && numberValue % 2 !== 0) {
              throw new Error('The field must be an even number')
            }
            if (config.specialTypes.includes('odd') && numberValue % 2 === 0) {
              throw new Error('The field must be an odd number')
            }
          }

          logInfo('number-validation', 'Number validation passed')
        } catch (error) {
          logError(
            'number-validation',
            `Error processing event: ${error.message}`
          )
          throw error
        }
      })
    })
  }
}

function isPrime(num: number): boolean {
  for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
    if (num % i === 0) return false
  }
  return num > 1
}
