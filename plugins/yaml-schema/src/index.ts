import { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { generateFields } from '@flatfile/plugin-convert-json-schema'
import {
  Setup,
  SetupFactory,
  configureSpace,
} from '@flatfile/plugin-space-configure'
import type {
  ModelToSheetConfig,
  PartialWorkbookConfig,
} from '@flatfile/util-fetch-schema'
import { getSchemas } from '@flatfile/util-fetch-schema/src'
import jsYaml from 'js-yaml'

export async function generateSetup(
  models?: ModelToSheetConfig[],
  schemas?: any[],
  options?: {
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  }
): Promise<SetupFactory> {
  const sheets = await Promise.all(
    models.map(async (model: ModelToSheetConfig, i) => {
      const data = schemas[i]
      const fields = await generateFields(data)
      return {
        name: model?.name || data.title,
        ...(data?.description && { description: data.description }),
        fields,
        ...model,
      }
    })
  )
  const setup: Setup = {
    workbooks: [
      {
        name: options?.workbookConfig?.name || 'YAML Schema Workbook',
        sheets,
      },
    ],
    ...options?.workbookConfig,
  }
  if (options?.debug) {
    console.dir(setup, { depth: null })
  }
  return setup
}

export function configureSpaceWithYamlSchema(
  models?: ModelToSheetConfig[],
  options?: {
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  },
  callback?: (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>
  ) => any | Promise<any>
) {
  return async function (listener: FlatfileListener) {
    const schemas = await getSchemas(models)
    listener.use(
      configureSpace(
        await generateSetup(
          models,
          schemas.map((schema) => jsYaml.load(schema)),
          options
        ),
        callback
      )
    )
  }
}
