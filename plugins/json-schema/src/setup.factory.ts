import { Flatfile } from '@flatfile/api'
import { Setup, SetupFactory } from '@flatfile/plugin-space-configure'
import axios from 'axios'

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

export async function generateSetup(
  url: string,
  options?: {
    model?: PartialSheetConfig
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  }
): Promise<SetupFactory> {
  const data = await fetchExternalReference(url)
  const fields = await generateFields(data)
  const setup: Setup = {
    workbooks: [
      {
        name: data.title,
        sheets: [
          {
            name: options?.model?.name || data.title,
            description: data.description || null,
            fields,
            ...options?.model,
          },
        ],
        ...options?.workbookConfig,
      },
    ],
  }
  return setup
}

async function generateFields(data: any): Promise<Flatfile.Property[]> {
  if (!data.properties) return []

  const fields = await Promise.all(
    Object.keys(data.properties).map((key) =>
      getPropertyType(
        data,
        data.properties[key],
        key,
        (data.required && data.required.includes(key)) || false
      )
    )
  )

  return fields.flat().filter(Boolean)
}

async function getPropertyType(
  schema: any,
  property: any,
  parentKey = '',
  isRequired = false
): Promise<Flatfile.Property[]> {
  if (property.$ref) {
    return getPropertyType(
      schema,
      await resolveReference(schema, property.$ref),
      parentKey
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
            (property.required && property.required.includes(key)) || false
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
      type: 'string',
      description: 'Comma-delimited list of values',
    },
    enum: {
      key: parentKey,
      type: 'enum',
      config: property.enum
        ? {
            options: property.enum.map((value: any) => ({
              value,
              label: String(value),
            })),
          }
        : undefined,
    },
  }

  const fieldConfig: Flatfile.Property = {
    label: parentKey,
    description: property.description || null,
    constraints: [{ type: 'required' }],
    ...fieldTypes[property.type],
  }

  return fieldTypes[fieldConfig.type] ? [fieldConfig] : []
}

async function resolveReference(schema: any, ref: string): Promise<any> {
  const hashIndex = ref.indexOf('#')

  if (ref.startsWith('#/')) return resolveLocalReference(schema, ref)

  const urlPart = hashIndex >= 0 ? ref.substring(0, hashIndex) : ref
  const fragmentPart = hashIndex >= 0 ? ref.substring(hashIndex) : ''

  const externalSchema = await fetchExternalReference(
    `http://localhost:1234${urlPart}`
  ) // TODO: dev hack

  return fragmentPart
    ? resolveLocalReference(externalSchema, fragmentPart)
    : externalSchema
}

function resolveLocalReference(schema: any, ref: string): any {
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

async function fetchExternalReference(url: string): Promise<any> {
  try {
    const { status, data } = await axios.get(url, {
      validateStatus: () => true,
    })
    if (status !== 200)
      throw new Error(`API returned status ${status}: ${data.statusText}`)
    return data
  } catch (error) {
    throw new Error(`Error fetching external reference: ${error.message}`)
  }
}
