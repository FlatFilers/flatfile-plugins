import axios from 'axios'

import { Flatfile } from '@flatfile/api'

import { SetupFactory } from '@flatfile/plugin-space-configure'

export interface ModelToSheetConfig extends PartialSheetConfig {
  sourceUrl: string
}

export type PartialSheetConfig = Omit<
  Flatfile.SheetConfig,
  'fields' | 'name'
> & {
  title?: string
  name?: string
}

export type PartialWorkbookConfig = Omit<
  Flatfile.CreateWorkbookConfig,
  'sheets' | 'name'
> & {
  name?: string
}

export async function getSchemas(models?: ModelToSheetConfig[]) {
  const schemas = models.map(async (model: ModelToSheetConfig) => {
    return await fetchExternalReference(model.sourceUrl)
  })

  return await Promise.all(schemas)
}

export async function fetchExternalReference(url: string): Promise<any> {
  try {
    const { status, data } = await axios.get(url, {
      validateStatus: () => true,
    })
    if (status !== 200)
      throw new Error(`API returned status ${status}: ${data.statusText}`)
    return data
  } catch (error: any) {
    throw new Error(`Error fetching external reference: ${error.message}`)
  }
}

export function resolveLocalReference(schema: any, ref: string): any {
  const resolved = ref
    .split('/')
    .slice(1)
    .reduce(
      (acc, part) =>
        acc && (acc[part] || acc.$defs?.[part] || acc.definitions?.[part]),
      schema
    )

  if (!resolved) throw new Error(`Cannot resolve reference: ${ref}`)
  return resolved
}

export * from './setup.factory'
