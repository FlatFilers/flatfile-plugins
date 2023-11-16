import { Flatfile } from '@flatfile/api'
import { Setup, SetupFactory } from '@flatfile/plugin-space-configure'
import {
  ModelToSheetConfig,
  PartialWorkbookConfig,
  fetchExternalReference,
  resolveLocalReference,
} from './index'

export async function generateSetup(
  schemas?: any[],
  options?: {
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  }
): Promise<SetupFactory> {
  const sheets = await Promise.all(
    schemas.map(async (schema: ModelToSheetConfig, i) => {
      const fields = await generateFields(schema)
      console.dir(schema, { depth: null })
      return {
        name: schema?.name || schema?.title || 'Sheet ' + (i + 1),
        ...(schema?.description && { description: schema.description }),
        fields,
        ...schema,
      }
    })
  )
  const setup: Setup = {
    workbooks: [
      {
        name: options?.workbookConfig?.name || 'JSON Schema Workbook',
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

export async function generateFields(data: any): Promise<Flatfile.Property[]> {
  if (!data.properties) return []

  const url = new URL(data.$id)
  const origin = url.origin

  const fields = await Promise.all(
    Object.keys(data.properties).map((key) =>
      getPropertyType(
        data,
        data.properties[key],
        key,
        (data.required && data.required.includes(key)) || false,
        origin
      )
    )
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
    return getPropertyType(
      schema,
      await resolveReference(schema, property.$ref, origin),
      parentKey,
      false,
      origin
    )
  }

  if (property.type === 'object' && property.properties) {
    return (
      await Promise.all(
        Object.keys(property.properties).map(async (key) => {
          return getPropertyType(
            property,
            property.properties[key],
            parentKey ? `${parentKey}_${key}` : key,
            (property.required && property.required.includes(key)) || false,
            origin
          )
        })
      )
    ).flat()
  }

  const fieldTypes: Record<string, Flatfile.Property> = {
    string: { key: parentKey, type: 'string' },
    number: { key: parentKey, type: 'number' },
    integer: { key: parentKey, type: 'number' },
    boolean: { key: parentKey, type: 'boolean' },
    array: {
      key: parentKey,
      type: 'enum',
      description: 'An enum of Selected Values',
      config: property.enum
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
    enum: {
      key: parentKey,
      type: 'enum',
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

  const fieldConfig: Flatfile.Property = {
    label: parentKey,
    ...(property?.description && { description: property.description }),
    ...(isRequired && { constraints: [{ type: 'required' }] }),
    ...fieldTypes[property.type],
  }

  return fieldTypes[fieldConfig.type] ? [fieldConfig] : []
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
