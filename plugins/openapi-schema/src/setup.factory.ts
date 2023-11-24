import { Flatfile } from '@flatfile/api'
import { SetupFactory } from '@flatfile/plugin-space-configure'
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

export type ModelsToSheetConfig = { [key: string]: PartialSheetConfig }

interface OpenApiSchema {
  type: string
  properties?: Record<string, any>
  enum?: string[]
  description?: string
  readOnly?: boolean
  $ref?: string
  [key: string]: any
}

interface ApiSchemas {
  [key: string]: OpenApiSchema
}

export async function generateSetup(
  url: string,
  options?: {
    models?: ModelsToSheetConfig
    workbookConfig?: PartialWorkbookConfig
    debug?: boolean
  }
): Promise<SetupFactory> {
  try {
    const { status, data } = await axios.get(url, {
      validateStatus: () => true,
    })

    if (status !== 200) {
      throw new Error(`API returned status ${status}: ${data.statusText}`)
    }

    const schemas: ApiSchemas = data.components.schemas

    const sheetConfigs: Flatfile.SheetConfig[] = await Promise.all(
      Object.entries(schemas)
        .filter(
          ([key]) => !options?.models || options?.models.hasOwnProperty(key)
        )
        .map(async ([key, schema]) => {
          const fields = await generateFields(schema, schemas)
          const modelDetails = options?.models?.[key]
          return {
            name: modelDetails?.name || key,
            fields,
            ...modelDetails,
          }
        })
    )

    return {
      workbooks: [
        {
          name: data.info.title,
          ...options?.workbookConfig,
          sheets: sheetConfigs,
        },
      ],
    }
  } catch (error) {
    console.error(error)
    throw new Error(`Error fetching or processing schema: ${error.message}`)
  }
}

export async function generateFields(
  data: any,
  origin: any
): Promise<Flatfile.Property[]> {
  if (!data.properties) return []

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
      await resolveReference(origin, property.$ref),
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

  if (property.allOf) {
    // Handle allOf construct
    let combinedProperty = {}
    for (const prop of property.allOf) {
      if (prop.$ref) {
        const resolved = await resolveReference(origin, prop.$ref)
        combinedProperty = { ...combinedProperty, ...resolved }
      } else {
        combinedProperty = { ...combinedProperty, ...prop }
      }
    }
    return getPropertyType(
      schema,
      combinedProperty,
      parentKey,
      isRequired,
      origin
    )
  }

  if (property.type === 'string' && property.enum) {
    return [
      {
        key: parentKey,
        type: 'enum',
        label: parentKey,
        ...(property?.description && { description: property.description }),
        ...(isRequired && { constraints: [{ type: 'required' }] }),
        config: {
          options: property.enum.map((value) => ({
            value,
            label: String(value),
          })),
        },
      },
    ]
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

export async function resolveReference(schema: any, ref: string): Promise<any> {
  const segments = ref.split('/')
  const modelName = segments[segments.length - 1]

  const model = schema[modelName]

  if (!model) throw new Error(`Cannot resolve reference: ${ref}`)
  return model
}
