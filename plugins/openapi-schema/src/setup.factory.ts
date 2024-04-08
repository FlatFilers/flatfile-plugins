import { Flatfile } from '@flatfile/api'
import { PartialWb, SetupFactory } from '@flatfile/plugin-space-configure'
import fetch from 'cross-fetch'

export type OpenAPISetupFactory = {
  workbooks: PartialWorkbookConfig[]
  space?: Partial<Flatfile.spaces.SpaceConfig>
  debug?: boolean
}

export interface PartialWorkbookConfig
  extends Omit<Flatfile.CreateWorkbookConfig, 'name' | 'sheets'> {
  name?: string
  sheets: PartialSheetConfig[]
  source: string
}

export interface PartialSheetConfig
  extends Omit<Flatfile.SheetConfig, 'fields' | 'name' | 'slug'> {
  name?: string
  slug?: string
  model: string
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
  setupFactory: OpenAPISetupFactory
): Promise<SetupFactory> {
  try {
    const workbooks: PartialWb[] = await Promise.all(
      setupFactory.workbooks.map(async (workbook) => {
        const response = await fetch(workbook.source)

        if (!response.ok) {
          throw new Error(
            `API returned status ${response.status}: ${response.statusText}`
          )
        }

        const data = await response.json()
        const schemas: ApiSchemas = data.components.schemas

        const sheets: Flatfile.SheetConfig[] = (
          await Promise.all(
            workbook.sheets.map(async (sheet) => {
              const modelName = sheet.model
              delete sheet.model
              const schema = schemas[modelName]
              if (!schema) {
                console.error(`Schema not found for table name ${sheet.slug}`)
                return
              }
              const fields: Flatfile.Property[] = await generateFields(
                schema,
                schemas
              )

              return {
                name: modelName,
                slug: modelName,
                ...sheet,
                fields,
              } as Flatfile.SheetConfig
            })
          )
        ).filter(Boolean)

        delete workbook.source

        return {
          name: data.info.title,
          ...workbook,
          sheets,
        } as PartialWb
      })
    )
    return { workbooks, space: setupFactory.space }
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
