import { Flatfile } from '@flatfile/api'
import { SetupFactory } from '@flatfile/plugin-space-configure'

import jsYaml from 'js-yaml'

import {
  PartialSheetConfig,
  SchemaSetupFactory,
  fetchExternalReference,
  getPropertyType,
  isValidUrl,
} from '@flatfile/util-fetch-schema'

export async function generateSetup(
  setupFactory: SchemaSetupFactory
): Promise<SetupFactory> {
  const workbooks = await Promise.all(
    setupFactory.workbooks.map(async (workbook) => {
      const sheets = await Promise.all(
        workbook.sheets.map(async (partialSheetConfig: PartialSheetConfig) => {
          const model = jsYaml.load(await getModel(partialSheetConfig.source))
          delete partialSheetConfig.source
          const fields = await generateFields(model)

          return {
            name: partialSheetConfig?.name || model.title,
            ...(model?.description && { description: model.description }),
            fields,
            ...partialSheetConfig,
          }
        })
      )

      return {
        ...workbook,
        sheets,
      }
    })
  )

  return { workbooks, space: setupFactory.space }
}

async function getModel(
  source: object | string | (() => object | Promise<object>)
) {
  if (typeof source === 'function') {
    return await source()
  }

  if (typeof source === 'string' && isValidUrl(source)) {
    return await fetchExternalReference(source)
  }

  return source
}

export async function generateFields(data: any): Promise<Flatfile.Property[]> {
  if (!data.properties) return []

  const getOrigin = (url: string) => {
    try {
      return new URL(url).origin
    } catch (error) {
      return ''
    }
  }
  const origin = getOrigin(data.$id)

  const fields = await Promise.all(
    Object.keys(data.properties).map(async (key) => {
      return await getPropertyType(
        data,
        data.properties[key],
        key,
        (data.required && data.required.includes(key)) || false,
        origin
      )
    })
  )
  return fields.flat().filter(Boolean)
}
