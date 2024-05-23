import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { TPrimitive } from '@flatfile/hooks'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import {
  FlatfileRecord,
  bulkRecordHookPlugin,
} from '@flatfile/plugin-record-hook'
import { getSheetConstraints } from './get.constraints'

const api = new FlatfileClient()

/**
 * Registers an external sheet constraint that can be applied to a combination of fields.
 *
 * @param validator - The name or identifier of the validator.
 * @param cb - The callback function to be executed for the sheet constraint.
 * @returns A function that takes a FlatfileListener and sets up the necessary event listeners and plugins.
 */
export const externalSheetConstraint = (
  validator: string,
  cb: (
    values: Record<string, TPrimitive>,
    keys: string[],
    support: {
      config: any
      record: FlatfileRecord
      properties: Flatfile.Property[]
      event: FlatfileEvent
    }
  ) => any
) => {
  return (listener: FlatfileListener) => {
    // Setup the cache
    // TODO: Cache this schema longer than one event
    listener.on('commit:created', async (e) => {
      await e.cache.init('sheet-schema', async () => {
        const res = await api.sheets.get(e.context.sheetId)
        return res.data.config
      })
    })

    listener.use(
      bulkRecordHookPlugin('**', async (records, event) => {
        const schema: Flatfile.SheetConfig = event.cache.get('sheet-schema')

        // Get the sheet constraints based on the provided validator
        const constraints = getSheetConstraints(schema, validator)

        constraints.forEach((constraint) => {
          const fields = constraint.fields || []
          records.forEach((record) => {
            try {
              // Execute the callback function for each record
              cb(partialObject(record, fields), constraint.fields, {
                config: constraint.config,
                record,
                properties: partialProperties(schema, fields),
                event,
              })
            } catch (e) {
              // Add errors to the corresponding fields if an exception occurs
              fields.forEach((key) => {
                record.addError(key, String(e))
              })
            }
          })
        })
      })
    )
  }
}

/**
 * Filters the properties of the schema based on the provided keys.
 *
 * @param schema - The Flatfile sheet configuration.
 * @param keys - An array of keys to filter the properties.
 * @returns An array of filtered Flatfile properties.
 */
function partialProperties(
  schema: Flatfile.SheetConfig,
  keys: string[] = []
): Flatfile.Property[] {
  return schema.fields.filter((f) => keys.includes(f.key))
}

/**
 * Creates a partial object with the specified keys from the given record.
 *
 * @param record - The Flatfile record.
 * @param keys - An array of keys to include in the partial object.
 * @returns A partial object containing the specified keys and their corresponding values from the record.
 */
function partialObject(record: FlatfileRecord, keys: string[]) {
  return keys.reduce(
    (acc, key) => {
      acc[key] = record.get(key)
      return acc
    },
    {} as Record<string, TPrimitive>
  )
}
