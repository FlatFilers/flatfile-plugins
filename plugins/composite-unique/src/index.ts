import { FlatfileListener } from '@flatfile/listener'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'

// Exanmple usage:
// listener.use(
//   compositeUniquePlugin({
//     sheetSlug: 'my-sheet',
//     name: 'new-field',
//     fields: ['field_1', 'field_2'],
//     source: (fields, record) => {
//       const field_1 = fields[0]
//       const field_2 = fields[1]
//       return field_1 + field_2
//     },
//   })
// )

export const getFields = (fields, record) => {
  return fields.map((field) => record.get(field))
}

export type CompositeFieldOptions = {
  sheetSlug: string
  name: string
  fields: string[]
  source?: ({
    fields,
    record,
  }: {
    fields: string[]
    record: FlatfileRecord
  }) => Promise<string> | string
}

/**
 * Dedupe plugin for Flatfile.
 *
 * @param jobOperation - job operation to match on
 * @param opts - plugin config options
 */
export const compositeUniquePlugin = (opts: CompositeFieldOptions) => {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(opts.sheetSlug, async (record) => {
        const fields = getFields(opts.fields, record)
        const result = !!opts.source
          ? await opts.source({ fields, record })
          : fields.join('')
        record.set(opts.name, result)
        // TODO: Get messages from CompositeField and add to source fields
        return record
      })
    )
  }
}
