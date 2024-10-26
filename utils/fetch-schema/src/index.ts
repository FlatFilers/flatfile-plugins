import type { Flatfile } from '@flatfile/api'
import fetch from 'cross-fetch'

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

export async function getSchemas(models: ModelToSheetConfig[]) {
  const schemas = models.map(async (model: ModelToSheetConfig) => {
    return await fetchExternalReference(model.sourceUrl)
  })

  return await Promise.all(schemas)
}

export async function fetchExternalReference(url: string): Promise<any> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `API returned status ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw new Error(
      `Error fetching external reference: ${(error as any).message}`
    )
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
