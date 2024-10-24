import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import {
  type StringValidationConfig,
  validateAndTransformString,
} from './validate.string.utils'

export function validateString(config: StringValidationConfig) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug || '**', (record) => {
        for (const field of config.fields) {
          const value = record.get(field) as string
          if (value !== null && value !== undefined) {
            const { value: newValue, error } = validateAndTransformString(
              value,
              config
            )
            if (error) {
              record.addError(field, error)
            }
            if (newValue !== value) {
              record.set(field, newValue)
            }
          }
        }
        return record
      })
    )
  }
}

export default validateString
