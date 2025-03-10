import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { FlatfileRecord, bulkRecordHook } from '@flatfile/plugin-record-hook'
import { getConstraints } from './get.constraints'

const api = new FlatfileClient()

export const externalConstraint = (
  validator: string,
  cb: (
    value: any,
    key: string,
    support: {
      config: any
      record: FlatfileRecord
      property: Flatfile.Property
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

        const constraints = getConstraints(schema, validator)

        for (const [property, constraint] of constraints) {
          for (const record of records) {
            try {
              await cb(record.get(property.key), property.key, {
                config: constraint.config,
                record,
                property,
                event,
              })
            } catch (e) {
              record.addError(property.key, String(e))
            }
          }
        }
      })
    )
  }
}
