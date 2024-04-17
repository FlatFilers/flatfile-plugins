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
      const sheetConfig = sheetConfigArray?.find(
        (config) => config.slug === object.name
      )

      if (sheetConfigArray?.length > 0 && !sheetConfig) return

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

  sheets.forEach((sheet) => {
    sheet.fields = sheet.fields.filter((field) => {
      if (field.type !== 'reference') {
        return true
      }

      const refSheet = sheets.find((s) => s.slug === field.config.ref)
      if (!refSheet) {
        console.warn(
          `Reference table '${field.config.ref}' not found. Removing field '${field.label}' from '${sheet.name}'.`
        )
        return false
      }

      field.config.key = refSheet.fields.find(
        (f) => f.type !== 'reference'
      )?.key

      if (!field.config.key) {
        console.warn(
          `Reference table '${refSheet.name}' does not contain a field that can be referenced by '${field.label}'. Removing field '${field.label}' from '${sheet.name}'.`
        )
        return false
      }

      console.log(
        `A valid reference field found for '${field.label}' in '${sheet.name}'.`
      )
      return true
    })
  })

  return sheets
}
