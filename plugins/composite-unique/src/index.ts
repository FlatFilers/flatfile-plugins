import { FlatfileListener } from '@flatfile/listener'
import { Flatfile } from '@flatfile/api'
import { FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'

// TODO: Remove this when Flatfile adds this type to their API
interface CompositePropertyAllOfConfig {
  /**
   *
   * @type {Array<string>}
   * @memberof CompositePropertyAllOfConfig
   */
  sources: Array<string>
}
export interface CompositeProperty {
  /**
   *
   * @type {string}
   * @memberof CompositeProperty
   */
  key: string
  /**
   *
   * @type {string}
   * @memberof CompositeProperty
   */
  type: CompositePropertyTypeEnum
  /**
   * User friendly field name
   * @type {string}
   * @memberof CompositeProperty
   */
  label?: string
  /**
   *
   * @type {string}
   * @memberof CompositeProperty
   */
  description?: string
  /**
   *
   * @type {Array<Constraint>}
   * @memberof CompositeProperty
   */
  constraints?: Array<Flatfile.Constraint>
  /**
   * Prevent user input into this field
   * @type {boolean}
   * @memberof CompositeProperty
   */
  readonly?: boolean
  /**
   * Useful for any contextual metadata regarding the schema. Store any valid json here.
   * @type {{ [key: string]: any; }}
   * @memberof CompositeProperty
   */
  metadata?: {
    [key: string]: any
  }
  /**
   *
   * @type {Array<string>}
   * @memberof CompositeProperty
   */
  treatments?: Array<string>
  /**
   *
   * @type {Array<string>}
   * @memberof CompositeProperty
   */
  alternativeNames?: Array<string>
  /**
   *
   * @type {CompositePropertyAllOfConfig}
   * @memberof CompositeProperty
   */
  config?: CompositePropertyAllOfConfig
}
/**
 * @export
 */
declare const CompositePropertyTypeEnum: {
  readonly Composite: 'composite'
}
type CompositePropertyTypeEnum =
  (typeof CompositePropertyTypeEnum)[keyof typeof CompositePropertyTypeEnum]

// Exanmple usage:
// listener.use(
//   compositeUniquePlugin({
//     sheetSlug: 'my-sheet',
//     field: 'new-field',
//     sources: ['field_1', 'field_2'],
//     handler: (fields, record) => {
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
  field: CompositeProperty
  handler?: ({
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
      recordHook(opts.sheetSlug, async (record, event) => {
        const sources = opts.field.config.sources
        const compositeFieldName = opts.field.key
        const fields = getFields(sources, record)
        const result = !!opts.handler
          ? await opts.handler({ fields, record })
          : fields.join('')
        record.set(compositeFieldName, result)
        return record
      })
    )
  }
}
