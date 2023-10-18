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

const convertPropertyToField = (
  key: string,
  property: OpenApiSchema,
  schemas: ApiSchemas,
  options?: { debug?: boolean }
): Flatfile.Property => {
  const baseField: Flatfile.BaseProperty = {
    key,
    label: property.title || key,
    description: `${property.description}`,
    readonly: property.readOnly || false,
    constraints: [],
  }

  const refName = property.$ref || property.allOf?.[0].$ref?.split('/').pop()
  if (refName) {
    property = schemas[refName]
  }

  switch (property.type) {
    case 'string':
      if (property.enum) {
        return {
          ...baseField,
          type: 'enum',
          config: {
            options: property.enum.map((e) => ({ label: e, value: e })),
          },
        } as Flatfile.Property.Enum
      }
      return { ...baseField, type: 'string' } as Flatfile.Property.String
    case 'integer':
    case 'number':
      return {
        ...baseField,
        type: 'number',
        config: { decimalPlaces: 0 },
      } as Flatfile.Property.Number
    case 'boolean':
      return { ...baseField, type: 'boolean' } as Flatfile.Property.Boolean
    default:
      if (options?.debug) {
        console.log(
          `Unsupported field '${baseField.label}' with property type '${property.type}'.`
        )
      }
      return
  }
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

    const sheetConfigs: Flatfile.SheetConfig[] = Object.entries(schemas)
      .filter(
        ([key]) => !options?.models || options?.models.hasOwnProperty(key)
      )
      .map(([key, schema]) => {
        const fields: Flatfile.Property[] = Object.entries(
          schema.properties || {}
        )
          .map(([propKey, property]) =>
            convertPropertyToField(propKey, property, schemas)
          )
          .filter(Boolean)

        const requiredFields = new Set(schema.required || [])
        fields.forEach((field) => {
          if (requiredFields.has(field.key)) {
            field.constraints?.push({ type: 'required' })
          }
        })

        const modelDetails = options?.models?.[key]
        return {
          name: modelDetails?.name || key,
          fields,
          ...modelDetails,
        }
      })

    return {
      workbooks: [
        {
          name: data.info.title,
          sheets: sheetConfigs,
          ...options?.workbookConfig,
        },
      ],
    }
  } catch (error) {
    console.error(error)
    throw new Error(`Error fetching or processing schema: ${error.message}`)
  }
}
