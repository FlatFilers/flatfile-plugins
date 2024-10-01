import { FlatfileListener } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
interface NumberValidationConfig {
  fields: string[] // Specify fields to validate
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
  sheetSlug?: string // Specify the sheet slug
}

export function validateNumber(config: NumberValidationConfig) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug || '**', async (record: FlatfileRecord) => {
        for (const field of config.fields) {
          const numberField = record.get(field)

          try {
            let numberValue: string | number = String(numberField)
              .replace(config.thousandsSeparator || ',', '')
              .replace(config.decimalPoint || '.', '.')
            numberValue = parseFloat(numberValue)

            if (isNaN(numberValue)) {
              record.addWarning(field, `The field '${field}' must be a number`)
            }

            if (config.round) {
              numberValue = Math.round(numberValue)
            }

            if (config.truncate) {
              numberValue = Math.trunc(numberValue)
            }

            if (config.integerOnly && !Number.isInteger(numberValue)) {
              record.addWarning(
                field,
                `The field '${field}' must be an integer`
              )
            }

            if (config.min !== undefined) {
              if (
                config.inclusive
                  ? numberValue < config.min
                  : numberValue <= config.min
              ) {
                record.addWarning(
                  field,
                  `The field '${field}' must be greater than ${
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
                record.addWarning(
                  field,
                  `The field '${field}' must be less than ${
                    config.inclusive ? 'or equal to ' : ''
                  }${config.max}`
                )
              }
            }

            if (config.precision !== undefined && config.scale !== undefined) {
              const [integerPart, decimalPart] = numberValue
                .toString()
                .split('.')
              if (integerPart.length > config.precision - config.scale) {
                record.addWarning(
                  field,
                  `The field '${field}' must have at most ${
                    config.precision - config.scale
                  } digits before the decimal point`
                )
              }
              if (decimalPart && decimalPart.length > config.scale) {
                record.addWarning(
                  field,
                  `The field '${field}' must have at most ${config.scale} digits after the decimal point`
                )
              }
            }

            if (
              config.currency &&
              !/^\d+(\.\d{1,2})?$/.test(numberValue.toString())
            ) {
              record.addWarning(
                field,
                `The field '${field}' must be a valid currency value with at most two decimal places`
              )
            }

            if (config.step !== undefined && numberValue % config.step !== 0) {
              record.addWarning(
                field,
                `The field '${field}' must be a multiple of ${config.step}`
              )
            }

            if (config.specialTypes) {
              if (
                config.specialTypes.includes('prime') &&
                !isPrime(numberValue)
              ) {
                record.addWarning(
                  field,
                  `The field '${field}' must be a prime number`
                )
              }
              if (
                config.specialTypes.includes('even') &&
                numberValue % 2 !== 0
              ) {
                record.addWarning(
                  field,
                  `The field '${field}' must be an even number`
                )
              }
              if (
                config.specialTypes.includes('odd') &&
                numberValue % 2 === 0
              ) {
                record.addWarning(
                  field,
                  `The field '${field}' must be an odd number`
                )
              }
            }
            record.set(field, numberValue)

            return record
          } catch (error) {
            record.addError(
              field,
              `Error processing event for field '${field}': ${error.message}`
            )
            throw error
          }
        }
      })
    )
  }
}

export default function isPrime(num: number): boolean {
  for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
    if (num % i === 0) return false
  }
  return num > 1
}
