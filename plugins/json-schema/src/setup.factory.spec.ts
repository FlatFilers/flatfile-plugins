import { describe, expect, it } from 'vitest'
import { generateSetup } from './setup.factory'

describe('generateSetup()', () => {
  const simpleJsonSchema = {
    $id: 'https://example.com',
    description:
      'A basic set of JSON Schema to test data type conversions simply',
    type: 'object',
    title: 'ExampleData',
    properties: {
      stringColumn: {
        description: 'A column for strings!',
        type: 'string',
      },
      integerColumn: {
        description: 'A column for integers!',
        type: 'integer',
      },
      arrayColumn: {
        description: 'A column for string arrays!',
        type: 'array',
        items: {
          type: 'string',
        },
      },
      objectColumn: {
        description:
          'A column for nested columns containing numbers and strings!',
        type: 'object',
        properties: {
          nestedUniqueNumberColumn: {
            description: 'A column for unique numbers!',
            type: 'number',
            uniqueItems: true,
          },
          nestedStringColumn: {
            type: 'string',
          },
        },
      },
    },
  }

  const expectedResult = {
    workbooks: [
      {
        name: 'JSON Schema Workbook',
        sheets: [
          {
            description:
              'A basic set of JSON Schema to test data type conversions simply',
            fields: [
              {
                description: 'A column for strings!',
                key: 'stringColumn',
                label: 'stringColumn',
                type: 'string',
              },
              {
                description: 'A column for integers!',
                key: 'integerColumn',
                label: 'integerColumn',
                type: 'number',
              },
              {
                config: { options: [] },
                description: 'An enum of Selected Values',
                key: 'arrayColumn',
                label: 'arrayColumn',
                type: 'enum',
              },
              {
                description: 'A column for unique numbers!',
                key: 'objectColumn_nestedUniqueNumberColumn',
                label: 'objectColumn_nestedUniqueNumberColumn',
                type: 'number',
              },
              {
                key: 'objectColumn_nestedStringColumn',
                label: 'objectColumn_nestedStringColumn',
                type: 'string',
              },
            ],
            name: 'ExampleData',
          },
        ],
      },
    ],
  }

  it('should generate a SetupFactory from JSON Schema', async () => {
    const results = await generateSetup({
      workbooks: [
        {
          name: 'JSON Schema Workbook',
          sheets: [
            {
              source: simpleJsonSchema,
            },
          ],
        },
      ],
    })

    expect(results).toMatchObject(expectedResult)
  })
})
