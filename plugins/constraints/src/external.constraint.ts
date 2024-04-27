import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import {
  FlatfileRecord,
  bulkRecordHookPlugin,
} from '@flatfile/plugin-record-hook'
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
  ) => any
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
      bulkRecordHookPlugin('**', async (records, event) => {
        const schema: Flatfile.SheetConfig = event.cache.get('sheet-schema')

        const constraints = getConstraints(schema, validator)

        constraints.forEach(([property, constraint]) => {
          records.forEach((record) => {
            try {
              cb(record.get(property.key), property.key, {
                config: constraint.config,
                record,
                property,
                event,
              })
            } catch (e) {
              record.addError(property.key, String(e))
            }
          })
        })
      })
    )
  }
}
