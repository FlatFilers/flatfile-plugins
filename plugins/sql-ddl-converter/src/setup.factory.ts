import { Flatfile } from '@flatfile/api'
import { generateFields } from '@flatfile/plugin-convert-json-schema'
import { PartialWb, SetupFactory } from '@flatfile/plugin-space-configure'
import { Parser } from 'sql-ddl-to-json-schema'

import * as fs from 'fs'
import * as path from 'path'

export type SqlSetupFactory = {
  workbooks: PartialWorkbookConfig[]
  space?: Partial<Flatfile.spaces.SpaceConfig>
}

export type PartialWorkbookConfig = Omit<
  Flatfile.CreateWorkbookConfig,
  'sheets'
> & {
  sheets: PartialSheetConfig[]
  source: string //object | string | (() => object | Promise<object>)
}

export type PartialSheetConfig = Omit<
  Flatfile.SheetConfig,
  'fields' | 'slug'
> & {
  slug: string
}

export async function generateSetup(
  setup: SqlSetupFactory
): Promise<SetupFactory> {
  const workbooks: PartialWb[] = await Promise.all(
    setup.workbooks.map(async (workbook) => {
      const sql: string = retrieveFromSource(workbook.source)

      const parser = new Parser('mysql')
      const compactJsonTablesArray = parser
        .feed(sql)
        .toCompactJson(parser.results)

      const schemas = parser
        .feed(sql)
        .toJsonSchemaArray({ useRef: true }, compactJsonTablesArray)

      const sheets: Flatfile.SheetConfig[] = (
        await Promise.all(
          workbook.sheets.map(async (sheet) => {
            const schema = schemas.find((schema) => schema.$id === sheet.slug)
            if (!schema) {
              console.error(`Schema not found for table name ${sheet.slug}`)
              return
            }
            const fields: Flatfile.Property[] = await generateFields(schema)

            const requiredFields = new Set(schema.required || [])
            fields.forEach((field) => {
              if (requiredFields.has(field.key)) {
                field.constraints?.push({ type: 'required' })
              }
            })

            return {
              ...sheet,
              fields,
            } as Flatfile.SheetConfig
          })
        )
      ).filter(Boolean)

      delete workbook.source

      return {
        ...workbook,
        sheets,
      } as PartialWb
    })
  )

  return {
    workbooks,
    space: setup.space,
  }
}

function retrieveFromSource(source: string): string {
  return fs.readFileSync(path.join(__dirname, '../', source)).toString()
}
