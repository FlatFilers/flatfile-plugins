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
                description: 'A column for string arrays!',
                key: 'arrayColumn',
                label: 'arrayColumn',
                type: 'string-list',
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

  it('should create multiple linked sheets for hierarchical JSON Schema', async () => {
    const hierarchicalSchema = {
      $id: 'https://example.com/booking',
      type: 'object',
      properties: {
        import: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalBookingId: {
                type: 'string',
                description: 'The original booking identifier',
              },
              lineItems: {
                type: 'array',
                items: {
                  $ref: '#/$defs/CartLineItem',
                },
              },
            },
            required: ['originalBookingId'],
          },
        },
      },
      $defs: {
        CartLineItem: {
          type: 'object',
          properties: {
            lineId: {
              type: 'string',
              description: 'Unique identifier for a line item',
            },
            productId: {
              type: 'integer',
              description: 'Unique identifier of a Product',
            },
          },
        },
      },
    }

    const results = await generateSetup({
      workbooks: [
        {
          name: 'Hierarchical Schema Workbook',
          sheets: [{ source: hierarchicalSchema }],
        },
      ],
    })

    expect(results.workbooks[0].sheets).toHaveLength(2)
    
    const cartLineItemSheet = results.workbooks[0].sheets.find(s => s.slug === 'CartLineItem')
    expect(cartLineItemSheet).toBeDefined()
    expect(cartLineItemSheet.name).toBe('Cart Line Item')
    expect(cartLineItemSheet.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'lineId',
          type: 'string',
          description: 'Unique identifier for a line item',
        }),
        expect.objectContaining({
          key: 'productId',
          type: 'number',
          description: 'Unique identifier of a Product',
        }),
      ])
    )

    const mainSheet = results.workbooks[0].sheets.find(s => s.slug === 'main')
    expect(mainSheet).toBeDefined()
    expect(mainSheet.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'import_lineItems',
          type: 'reference-list',
          config: { ref: 'CartLineItem', key: 'id', relationship: 'has-many' },
        }),
      ])
    )
  })

  it('should handle the booking-import.schema.json correctly', async () => {
    const bookingSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'https://apiv4.checkfront.com/booking-import.schema.json',
      title: 'Booking Import',
      description: 'A booking import schema',
      type: 'object',
      properties: {
        import: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              originalBookingId: {
                description: 'The original booking identifier',
                type: 'string',
              },
              lineItems: {
                description: 'List of LineItems to book',
                type: 'array',
                items: {
                  $ref: '#/$defs/CartLineItem',
                },
              },
              bookingFields: {
                description: 'List of FormFields with their values',
                type: 'array',
                items: {
                  $ref: '#/$defs/CartFormField',
                },
              },
            },
            required: ['originalBookingId', 'lineItems'],
          },
        },
      },
      $defs: {
        CartLineItem: {
          type: 'object',
          properties: {
            lineId: {
              description:
                'Unique identifier for a line item. Must be greater than 0 and must start from 1.',
              type: 'string',
              example: '1.1',
            },
            productId: {
              description: 'Unique identifier of a Product',
              type: 'integer',
              example: 204,
            },
            start: {
              description: 'The date and time when the line item begins.',
              type: 'string',
              format: 'date-time',
              example: '2021-05-06T13:00:00',
            },
            end: {
              description: 'The date and time when the line item ends.',
              type: 'string',
              format: 'date-time',
              example: '2021-05-06T14:00:00',
            },
            pricing: {
              $ref: '#/$defs/LineItemPricing',
            },
          },
        },
        CartFormField: {
          type: 'object',
          properties: {
            fieldId: {
              description: "The form field's identifier",
              type: 'string',
              example: 'customer_name',
            },
            value: {
              description: 'The value entered for the field',
              type: 'string',
              example: 'Jane Smith',
            },
          },
        },
        LineItemPricing: {
          type: 'object',
          properties: {
            subTotal: {
              description: 'The line item total cost, in cents',
              type: 'integer',
              example: 6000,
            },
            inclusiveTaxTotal: {
              description:
                'The total of inclusive taxes (already in line item prices, eg. VAT), in cents',
              type: 'integer',
              example: 300,
            },
            taxTotal: {
              description: 'The total of additive taxes, in cents',
              type: 'integer',
              example: 720,
            },
          },
        },
      },
    }

    const results = await generateSetup({
      workbooks: [
        {
          name: 'Booking Import Workbook',
          sheets: [{ source: bookingSchema }],
        },
      ],
    })

    const fields = results.workbooks[0].sheets[0].fields

    expect(results.workbooks[0].sheets).toHaveLength(4)
    
    const sheetSlugs = results.workbooks[0].sheets.map(s => s.slug)
    expect(sheetSlugs).toContain('CartLineItem')
    expect(sheetSlugs).toContain('CartFormField')
    expect(sheetSlugs).toContain('LineItemPricing')
    expect(sheetSlugs).toContain('main')

    const cartLineItemSheet = results.workbooks[0].sheets.find(s => s.slug === 'CartLineItem')
    expect(cartLineItemSheet.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'pricing',
          type: 'reference',
          config: { ref: 'LineItemPricing', key: 'id', relationship: 'has-one' },
        }),
      ])
    )

    const mainSheet = results.workbooks[0].sheets.find(s => s.slug === 'main')
    expect(mainSheet.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'import_lineItems',
          type: 'reference-list',
          config: { ref: 'CartLineItem', key: 'id', relationship: 'has-many' },
        }),
        expect.objectContaining({
          key: 'import_bookingFields',
          type: 'reference-list',
          config: { ref: 'CartFormField', key: 'id', relationship: 'has-many' },
        }),
      ])
    )
  })

  it('should maintain backward compatibility with flat schemas', async () => {
    const flatSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Person name',
        },
        age: {
          type: 'integer',
          description: 'Person age',
        },
      },
      required: ['name'],
    }

    const results = await generateSetup({
      workbooks: [
        {
          name: 'Flat Schema Workbook',
          sheets: [{ source: flatSchema }],
        },
      ],
    })

    expect(results.workbooks[0].sheets).toHaveLength(1)
    expect(results.workbooks[0].sheets[0].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'name',
          type: 'string',
          description: 'Person name',
        }),
        expect.objectContaining({
          key: 'age',
          type: 'number',
          description: 'Person age',
        }),
      ])
    )
  })
})
