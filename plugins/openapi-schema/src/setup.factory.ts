import { Flatfile } from '@flatfile/api'
import { SetupFactory } from '@flatfile/plugin-space-configure'
import axios from 'axios'

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
  models?: Record<string, string>
): Promise<SetupFactory> {
  try {
    const response = await axios({
      url,
      validateStatus: () => true,
      responseType: 'json',
    })

    if (response.status !== 200) {
      throw new Error(
        `API returned status ${response.status}: ${response.statusText}`
      )
    }

    const schemas: ApiSchemas = response.data.components.schemas

    function convertPropertyToField(
      key: string,
      property: OpenApiSchema
    ): Flatfile.BaseProperty | Flatfile.Property {
      let field: Flatfile.BaseProperty = {
        key: key,
        label: property.title || key,
        description: `${property.description}`,
        readonly: property.readOnly || false,
        constraints: [],
      }

      if (property.$ref) {
        const refName = property.$ref.split('/').pop()!
        property = schemas[refName]
      } else if (property.allOf) {
        // If allOf is present, assume the first item in the array is a reference to the actual schema
        const refName = property.allOf[0].$ref.split('/').pop()!
        property = schemas[refName]
      }

      switch (property.type) {
        case 'string':
          if (property.enum) {
            return {
              ...field,
              type: 'enum',
              config: {
                options: property.enum.map((e) => ({
                  label: e,
                  value: e,
                })),
              },
            } as Flatfile.EnumProperty
          } else {
            return {
              ...field,
              type: 'string',
            } as Flatfile.Property.String
          }
        case 'integer':
        case 'number':
          return {
            ...field,
            type: 'number',
            config: {
              decimalPlaces: 0, // default decimal places
            },
          } as Flatfile.Property.Number
        case 'boolean':
          return {
            ...field,
            type: 'boolean',
          } as Flatfile.Property.Boolean
        default:
          console.log(
            `Unhandled field '${field.label}' with property type '${property.type}'.`
          )
      }
    }

    const sheetConfigs: Flatfile.SheetConfig[] = []
    for (const [key, schema] of Object.entries(schemas)) {
      if (models && !models.hasOwnProperty(key)) {
        continue
      }
      const fields: Flatfile.Property[] = []
      const requiredFields = schema.required || []

      for (const [key, property] of Object.entries(schema.properties || {})) {
        const field = convertPropertyToField(key, property) as Flatfile.Property
        if (field) {
          if (requiredFields.includes(key)) {
            field.constraints?.push({
              type: 'required',
            })
          }
          fields.push(field)
        }
      }

      sheetConfigs.push({
        name: key,
        slug:
          models && models.hasOwnProperty(key)
            ? models[key]
            : key.toLowerCase(),
        fields: fields,
      })
    }

    return {
      workbooks: [
        {
          name: response.data.info.title,
          sheets: sheetConfigs,
        },
      ],
    }
  } catch (error) {
    console.error(error)
    throw new Error(`Error fetching or processing schema: ${error.message}`)
  }
}
