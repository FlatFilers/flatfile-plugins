import { Flatfile } from '@flatfile/api'
import { SetupFactory } from '@flatfile/plugin-space-configure'

import jsYaml from 'js-yaml'

import {
  PartialSheetConfig,
  SchemaSetupFactory,
  fetchExternalReference,
  generateFields,
  getModel,
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
