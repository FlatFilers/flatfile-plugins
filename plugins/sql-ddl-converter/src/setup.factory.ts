import { Flatfile } from '@flatfile/api'
import { generateFields } from '@flatfile/plugin-convert-json-schema'
import { SetupFactory } from '@flatfile/plugin-space-configure'
import { Parser } from 'sql-ddl-to-json-schema'

import { FlatfileEvent } from '@flatfile/listener'
import * as fs from 'fs'
import * as path from 'path'

export type PartialWorkbookConfig = Omit<
  Flatfile.CreateWorkbookConfig,
  'sheets' | 'name'
> & {
  name?: string
}
export type PartialSheetConfig = Omit<
  Flatfile.SheetConfig,
  'fields' | 'name'
> & {
  name?: string
}

export type ModelsToSheetConfig = { [key: string]: PartialSheetConfig }

export async function generateSetup(
  sqlDdlPath: string,
  options?: {
    models?: ModelsToSheetConfig
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  }
): Promise<SetupFactory> {
  const sql: string = fs
    .readFileSync(path.join(__dirname, '../', sqlDdlPath))
    .toString()

  const parser = new Parser('mysql')
  const compactJsonTablesArray = parser.feed(sql).toCompactJson(parser.results)
  // console.dir(compactJsonTablesArray, { depth: null })
  const schemas = parser
    .feed(sql)
    .toJsonSchemaArray({ useRef: true }, compactJsonTablesArray)
  // console.dir(schemas, { depth: null })
  const sheetConfigs: Flatfile.SheetConfig[] = await Promise.all(
    Object.entries(schemas)
      .filter(
        ([key]) => !options?.models || options?.models.hasOwnProperty(key)
      )
      .map(async ([key, schema]) => {
        const fields: Flatfile.Property[] = await generateFields(schema)

        const requiredFields = new Set(schema.required || [])
        fields.forEach((field) => {
          if (requiredFields.has(field.key)) {
            field.constraints?.push({ type: 'required' })
          }
        })

        const modelDetails = options?.models?.[schema.title]
        return {
          name: modelDetails?.name || schema.title,
          slug: modelDetails?.slug || schema.title,
          fields,
          ...modelDetails,
        }
      })
  )
  // console.dir(sheetConfigs, { depth: null })
  return {
    workbooks: [
      {
        name: 'Hello world',
        sheets: sheetConfigs,
        ...options?.workbookConfig,
      },
    ],
  }
}
