import type { Flatfile } from '@flatfile/api'
import { capitalCase } from 'change-case'
import { generateField } from './generate.field'

export function generateSheets(
  graphQLObjects,
  sheetConfigArray
): Flatfile.SheetConfig[] {
  return graphQLObjects
    .map((object) => {
      let sheetConfig =
        sheetConfigArray?.find((config) => config.slug === object.name) || {}

      const fields = object.fields
        .map((field) => generateField(field, object.name))
        .filter(Boolean)
      if (!fields.some((field) => field.key === 'id')) {
        fields.unshift({ key: 'id', label: 'Id', type: 'number' })
      }

      return fields.length
        ? {
            ...sheetConfig,
            name: capitalCase(object.name),
            fields,
            slug: object.name,
            description: object.description || '',
          }
        : null
    })
    .filter(
      (sheet) =>
        sheet &&
        (!sheet.fields ||
          sheet.fields.every(
            (field) =>
              field.type !== 'reference' ||
              graphQLObjects.some((obj) => obj.name === field.config.ref)
          ))
    )
}
