import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { TRecordValue } from '@flatfile/hooks'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { FlatfileRecord, bulkRecordHook } from '@flatfile/plugin-record-hook'
import { getSheetConstraints } from './get.constraints'

const api = new FlatfileClient()

/**
 * External sheet constraints can be registered on a combination of fields. Unlike the single
 * field validator, the sheet constraint will return a partial object containing the fields
 * references in the sheet constraint along with the configuration of the constraint.
 *
 * @param validator
 * @param cb
 */
export const externalSheetConstraint = (
  validator: string,
  cb: (
    values: Record<string, TRecordValue>,
    keys: string[],
    support: {
      config: any
      record: FlatfileRecord
      properties: Flatfile.Property[]
      event: FlatfileEvent
    }
  ) => any | Promise<any>
) => {
  return (listener: FlatfileListener) => {
    // setup the cache
    // todo: cache this schema longer than one event
    listener.on('commit:created', async (e) => {
      await e.cache.init('sheet-schema', async () => {
        const res = await api.sheets.get(e.context.sheetId)
        return res.data.config
      })
    })

    listener.use(
      bulkRecordHook('**', async (records, event) => {
        const schema: Flatfile.SheetConfig = event.cache.get('sheet-schema')

        const constraints = getSheetConstraints(schema, validator)

        for (const constraint of constraints) {
          const fields = constraint.fields || []
          for (const record of records) {
            try {
              await cb(partialObject(record, fields), constraint.fields, {
                config: constraint.config,
                record,
                properties: partialProperties(schema, fields),
                event,
              })
            } catch (e) {
              fields.forEach((key) => {
                record.addError(key, String(e))
              })
            }
          }
        }
      })
    )
  }
}

function partialProperties(
  schema: Flatfile.SheetConfig,
  keys: string[] = []
): Flatfile.Property[] {
  return schema.fields.filter((f) => keys.includes(f.key))
}

function partialObject(record: FlatfileRecord, keys: string[]) {
  return keys.reduce(
    (acc, key) => {
      acc[key] = record.get(key)
      return acc
    },
    {} as Record<string, TRecordValue>
  )
}
