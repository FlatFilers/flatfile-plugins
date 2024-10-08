import { FlatfileListener } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'

export interface NumberValidationConfig {
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

export interface NumberValidationResult {
  value: number | null
  errors: string[]
  warnings: string[]
}

export function validateNumberField(
  value: string | number,
  config: NumberValidationConfig
): NumberValidationResult {
  const result: NumberValidationResult = {
    value: null,
    errors: [],
    warnings: [],
  }

  try {
    let numberValue: string | number = String(value)
      .replace(config.thousandsSeparator || ',', '')
      .replace(config.decimalPoint || '.', '.')
    numberValue = parseFloat(numberValue)

    if (isNaN(numberValue)) {
      result.errors.push('Must be a number')
      return result
    }

    if (config.round) {
      numberValue = Math.round(numberValue)
    }

    if (config.truncate) {
      numberValue = Math.trunc(numberValue)
    }

    if (config.integerOnly && !Number.isInteger(numberValue)) {
      result.warnings.push('Must be an integer')
    }

    if (config.min !== undefined) {
      if (
        config.inclusive ? numberValue < config.min : numberValue <= config.min
      ) {
        result.warnings.push(
          `Must be greater than ${config.inclusive ? 'or equal to ' : ''}${config.min}`
        )
      }
    }

    if (config.max !== undefined) {
      if (
        config.inclusive ? numberValue > config.max : numberValue >= config.max
      ) {
        result.warnings.push(
          `Must be less than ${config.inclusive ? 'or equal to ' : ''}${config.max}`
        )
      }
    }

    if (config.precision !== undefined && config.scale !== undefined) {
      const [integerPart, decimalPart] = numberValue.toString().split('.')
      if (integerPart.length > config.precision - config.scale) {
        result.warnings.push(
          `Must have at most ${config.precision - config.scale} digits before the decimal point`
        )
      }
      if (decimalPart && decimalPart.length > config.scale) {
        result.warnings.push(
          `Must have at most ${config.scale} digits after the decimal point`
        )
      }
    }

    if (config.currency && !/^\d+(\.\d{1,2})?$/.test(numberValue.toString())) {
      result.warnings.push(
        'Must be a valid currency value with at most two decimal places'
      )
    }

    if (config.step !== undefined && numberValue % config.step !== 0) {
      result.warnings.push(`Must be a multiple of ${config.step}`)
    }

    if (config.specialTypes) {
      if (config.specialTypes.includes('prime') && !isPrime(numberValue)) {
        result.warnings.push('Must be a prime number')
      }
      if (config.specialTypes.includes('even') && numberValue % 2 !== 0) {
        result.warnings.push('Must be an even number')
      }
      if (config.specialTypes.includes('odd') && numberValue % 2 === 0) {
        result.warnings.push('Must be an odd number')
      }
    }

    result.value = numberValue
  } catch (error) {
    result.errors.push(`Error processing value: ${error.message}`)
  }

  return result
}

export function validateNumber(
  config: NumberValidationConfig & { fields: string[]; sheetSlug?: string }
) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug || '**', async (record: FlatfileRecord) => {
        for (const field of config.fields) {
          const value = record.get(field)
          if (typeof value !== 'string' && typeof value !== 'number') {
            return record
          }
          const result = validateNumberField(value, config)
          if (result.value !== null) {
            record.set(field, result.value)
          }

          result.errors.forEach((error) => record.addError(field, error))
          result.warnings.forEach((warning) =>
            record.addWarning(field, warning)
          )
        }
        return record
      })
    )
  }
}

export function isPrime(num: number): boolean {
  for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
    if (num % i === 0) return false
  }
  return num > 1
}
