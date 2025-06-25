import type { Flatfile } from '@flatfile/api'
import type { Setup } from '@flatfile/plugin-space-configure'
import fetch from 'cross-fetch'
import { capitalCase } from 'change-case'

export type JsonSetupFactory = {
  workbooks: PartialWorkbookConfig[]
  space?: Partial<Flatfile.spaces.SpaceConfig>
}

export interface PartialWorkbookConfig
  extends Omit<Flatfile.CreateWorkbookConfig, 'sheets'> {
  sheets: PartialSheetConfig[]
}

export interface PartialSheetConfig
  extends Omit<Flatfile.SheetConfig, 'fields' | 'name'> {
  name?: string
  source: object | string | (() => object | Promise<object>)
}

export async function generateSetup(
  setupFactory: JsonSetupFactory
): Promise<Setup> {
  const workbooks = await Promise.all(
    setupFactory.workbooks.map(async (workbook) => {
      const sheets = await Promise.all(
        workbook.sheets.map(async (partialSheetConfig: PartialSheetConfig) => {
          const model = await getModel(partialSheetConfig.source)
          
          if (model.$defs && Object.keys(model.$defs).length > 0) {
            return await generateHierarchicalSheets(model, partialSheetConfig)
          } else {
            const fields = await generateFields(model)
            return {
              name: partialSheetConfig?.name || model.title,
              ...(model?.description && { description: model.description }),
              fields,
              ...partialSheetConfig,
            }
          }
        })
      )

      return {
        ...workbook,
        sheets: sheets.flat(),
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

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

export async function generateFields(data: any): Promise<Flatfile.Property[]> {
  if (!data || !data.properties) return []

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

export async function getPropertyType(
  schema: any,
  property: any,
  parentKey = '',
  isRequired = false,
  origin: string
): Promise<Flatfile.Property[]> {
  if (property.$ref) {
    const resolvedProperty = await resolveReference(
      schema,
      property.$ref,
      origin
    )
    return await getPropertyType(
      schema,
      resolvedProperty,
      parentKey,
      false,
      origin
    )
  }

  if (property.type === 'object' && property.properties) {
    const propertyFields = await Promise.all(
      Object.keys(property.properties).map(async (key) => {
        return await getPropertyType(
          property,
          property.properties[key],
          parentKey ? `${parentKey}_${key}` : key,
          (property.required && property.required.includes(key)) || false,
          origin
        )
      })
    )
    return propertyFields.flat()
  }



  const fieldTypes: Record<string, Flatfile.Property> = {
    string: { key: parentKey, type: 'string' },
    number: { key: parentKey, type: 'number' },
    integer: { key: parentKey, type: 'number' },
    boolean: { key: parentKey, type: 'boolean' },
    enum: {
      key: parentKey,
      type: 'enum-list',
      config: property?.enum
        ? {
            options: property.enum.map((value: any) => ({
              value,
              label: String(value),
            })),
          }
        : {
            options: [],
          },
    },
  }

  if (!fieldTypes[property.type]) return []

  const fieldConfig: Flatfile.Property = {
    label: parentKey,
    ...(property?.description && { description: property.description }),
    ...(isRequired && { constraints: [{ type: 'required' }] }),
    ...fieldTypes[property.type],
  }

  return [fieldConfig]
}

export async function resolveReference(
  schema: any,
  ref: string,
  origin: string
): Promise<any> {
  const hashIndex = ref.indexOf('#')

  if (ref.startsWith('#/')) return resolveLocalReference(schema, ref)

  const urlPart = hashIndex >= 0 ? ref.substring(0, hashIndex) : ref
  const fragmentPart = hashIndex >= 0 ? ref.substring(hashIndex) : ''

  const externalSchema = await fetchExternalReference(`${origin}${urlPart}`)

  return fragmentPart
    ? resolveLocalReference(externalSchema, fragmentPart)
    : externalSchema
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

async function generateHierarchicalSheets(
  schema: any,
  partialSheetConfig: PartialSheetConfig
): Promise<Flatfile.SheetConfig[]> {
  const sheets: Flatfile.SheetConfig[] = []
  const origin = getOrigin(schema.$id)

  for (const [defName, defSchema] of Object.entries(schema.$defs || {})) {
    if (defSchema.type === 'object' && defSchema.properties) {
      const fields = await generateFieldsForSheet(schema, defSchema, origin)
      
      sheets.push({
        name: capitalCase(defName),
        slug: defName,
        description: defSchema.description || `${capitalCase(defName)} data`,
        fields,
        ...partialSheetConfig,
      })
    }
  }

  if (schema.properties && Object.keys(schema.properties).length > 0) {
    const fields = await generateFieldsForSheet(schema, schema, origin)
    
    sheets.unshift({
      name: partialSheetConfig?.name || schema.title || 'Main',
      slug: 'main',
      description: schema.description || 'Main data sheet',
      fields,
      ...partialSheetConfig,
    })
  }

  return sheets
}

async function generateFieldsForSheet(
  rootSchema: any,
  schema: any,
  origin: string
): Promise<Flatfile.Property[]> {
  if (!schema || !schema.properties) return []

  const fields = await Promise.all(
    Object.keys(schema.properties).map(async (key) => {
      return await getPropertyTypeForSheet(
        rootSchema,
        schema.properties[key],
        key,
        (schema.required && schema.required.includes(key)) || false,
        origin
      )
    })
  )
  return fields.flat().filter(Boolean)
}

async function getPropertyTypeForSheet(
  rootSchema: any,
  property: any,
  parentKey = '',
  isRequired = false,
  origin: string
): Promise<Flatfile.Property[]> {
  if (property.$ref) {
    const refPath = property.$ref
    if (refPath.startsWith('#/$defs/')) {
      const defName = refPath.replace('#/$defs/', '')
      return [{
        key: parentKey,
        type: 'reference',
        label: capitalCase(parentKey),
        ...(property?.description && { description: property.description }),
        ...(isRequired && { constraints: [{ type: 'required' }] }),
        config: { ref: defName, key: 'id', relationship: 'has-one' }
      }]
    } else {
      const resolvedProperty = await resolveReference(rootSchema, refPath, origin)
      return await getPropertyTypeForSheet(
        rootSchema,
        resolvedProperty,
        parentKey,
        isRequired,
        origin
      )
    }
  }

  if (property.type === 'array') {
    return await handleArrayTypeForSheet(
      rootSchema,
      property,
      parentKey,
      isRequired,
      origin
    )
  }

  if (property.type === 'object' && property.properties) {
    const propertyFields = await Promise.all(
      Object.keys(property.properties).map(async (key) => {
        return await getPropertyTypeForSheet(
          rootSchema,
          property.properties[key],
          parentKey ? `${parentKey}_${key}` : key,
          (property.required && property.required.includes(key)) || false,
          origin
        )
      })
    )
    return propertyFields.flat()
  }

  const fieldTypes: Record<string, Flatfile.Property> = {
    string: { key: parentKey, type: 'string' },
    number: { key: parentKey, type: 'number' },
    integer: { key: parentKey, type: 'number' },
    boolean: { key: parentKey, type: 'boolean' },
    enum: {
      key: parentKey,
      type: 'enum-list',
      config: property?.enum
        ? {
            options: property.enum.map((value: any) => ({
              value,
              label: String(value),
            })),
          }
        : {
            options: [],
          },
    },
  }

  if (!fieldTypes[property.type]) return []

  const fieldConfig: Flatfile.Property = {
    label: capitalCase(parentKey),
    ...(property?.description && { description: property.description }),
    ...(isRequired && { constraints: [{ type: 'required' }] }),
    ...fieldTypes[property.type],
  }

  return [fieldConfig]
}

async function handleArrayTypeForSheet(
  rootSchema: any,
  property: any,
  parentKey: string,
  isRequired: boolean,
  origin: string
): Promise<Flatfile.Property[]> {
  if (!property.items) {
    return [
      {
        key: parentKey,
        type: 'string-list',
        label: capitalCase(parentKey),
        ...(property?.description && { description: property.description }),
        ...(isRequired && { constraints: [{ type: 'required' }] }),
      },
    ]
  }

  if (property.items.$ref && property.items.$ref.startsWith('#/$defs/')) {
    const defName = property.items.$ref.replace('#/$defs/', '')
    return [{
      key: parentKey,
      type: 'reference-list',
      label: capitalCase(parentKey),
      ...(property?.description && { description: property.description }),
      ...(isRequired && { constraints: [{ type: 'required' }] }),
      config: { ref: defName, key: 'id', relationship: 'has-many' }
    }]
  }

  if (property.items.type && property.items.type !== 'object') {
    return [
      {
        key: parentKey,
        type: 'string-list',
        label: capitalCase(parentKey),
        ...(property?.description && { description: property.description }),
        ...(isRequired && { constraints: [{ type: 'required' }] }),
      },
    ]
  }

  const itemSchema = property.items.$ref
    ? await resolveReference(rootSchema, property.items.$ref, origin)
    : property.items

  if (itemSchema.type === 'object' && itemSchema.properties) {
    const itemFields = await Promise.all(
      Object.keys(itemSchema.properties).map(async (key) => {
        return await getPropertyTypeForSheet(
          rootSchema,
          itemSchema.properties[key],
          `${parentKey}_${key}`,
          (itemSchema.required && itemSchema.required.includes(key)) || false,
          origin
        )
      })
    )
    return itemFields.flat()
  }

  return [
    {
      key: parentKey,
      type: 'string-list',
      label: capitalCase(parentKey),
      ...(property?.description && { description: property.description }),
      ...(isRequired && { constraints: [{ type: 'required' }] }),
    },
  ]
}

function getOrigin(url?: string): string {
  if (!url) return ''
  try {
    return new URL(url).origin
  } catch (error) {
    return ''
  }
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
