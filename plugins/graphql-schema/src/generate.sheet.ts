import type { Flatfile } from '@flatfile/api'
import { capitalCase } from 'change-case'
import { generateField } from './generate.field'
import { PartialSheetConfig } from './types'

export function generateSheets(
  graphQLObjects,
  sheetConfigArray: PartialSheetConfig[]
): Flatfile.SheetConfig[] {
  const sheets = graphQLObjects
    .map((object) => {
      let sheetConfig =
        sheetConfigArray?.find((config) => config.slug === object.name) || {}

      const fields = object.fields
        .map((field) => generateField(field, object.name))
        .filter(Boolean)

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

  sheets.map((sheet) => {
    sheet.fields.map((field) => {
      if (field.type === 'reference') {
        const refSheet = sheets.find((s) => s.slug === field.config.ref)
        if (refSheet) {
          // TODO: what is a better way to get the config.key?
          field.config.key = refSheet.fields.find(
            (f) => f.type !== 'reference'
          )?.key
        }
      }
    })
  })

  return sheets
}
