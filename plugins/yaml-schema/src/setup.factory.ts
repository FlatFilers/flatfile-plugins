import type { Flatfile } from '@flatfile/api'
import { generateFields } from '@flatfile/plugin-convert-json-schema'
import { Setup, SetupFactory } from '@flatfile/plugin-space-configure'
import jsYaml from 'js-yaml'

export interface ModelToSheetConfig extends PartialSheetConfig {
  sourceUrl: string
}

export interface PartialSheetConfig
  extends Omit<Flatfile.SheetConfig, 'fields' | 'name'> {
  name?: string
}

export interface PartialWorkbookConfig
  extends Omit<Flatfile.CreateWorkbookConfig, 'sheets' | 'name'> {
  name?: string
}

export async function generateSetup(
  models?: ModelToSheetConfig[],
  options?: {
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  }
): Promise<SetupFactory> {
  const schemas = await getSchemas(models)
  const asdf = schemas.map((schema) => jsYaml.load(schema))

  const sheets = await Promise.all(
    models.map(async (model: ModelToSheetConfig, i) => {
      const data = asdf[i]
      const fields = await generateFields(data)
      delete model.sourceUrl
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

async function getSchemas(models?: ModelToSheetConfig[]) {
  const schemas = models.map(async (model: ModelToSheetConfig) => {
    return await fetchExternalReference(model.sourceUrl)
  })

  return await Promise.all(schemas)
}

async function fetchExternalReference(url: string): Promise<any> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `API returned status ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.text()
    return data
  } catch (error) {
    throw new Error(
      `Error fetching external reference: ${(error as any).message}`
    )
  }
}
