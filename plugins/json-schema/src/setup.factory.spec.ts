import { describe, expect, it } from 'vitest'
import { generateSetup } from './setup.factory'

describe('setup.factory', () => {
  const simpleJsonSchema = {
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
      email: {
        type: 'string',
        description: 'Person email',
      },
      address: {
        type: 'object',
        properties: {
          street: {
            type: 'string',
            description: 'Street address',
          },
          city: {
            type: 'string',
            description: 'City',
          },
          zipCode: {
            type: 'string',
            description: 'ZIP code',
          },
        },
      },
    },
    required: ['name', 'email'],
  }

  const expectedResult = [
    {
      key: 'name',
      type: 'string',
      label: 'name',
      description: 'Person name',
      constraints: [{ type: 'required' }],
    },
    {
      key: 'age',
      type: 'number',
      label: 'age',
      description: 'Person age',
    },
    {
      key: 'email',
      type: 'string',
      label: 'email',
      description: 'Person email',
      constraints: [{ type: 'required' }],
    },
    {
      key: 'address_street',
      type: 'string',
      label: 'address_street',
      description: 'Street address',
    },
    {
      key: 'address_city',
      type: 'string',
      label: 'address_city',
      description: 'City',
    },
    {
      key: 'address_zipCode',
      type: 'string',
      label: 'address_zipCode',
      description: 'ZIP code',
    },
  ]

  it('should generate setup from simple JSON schema', async () => {
    const results = await generateSetup({
      workbooks: [
        {
          name: 'Test Workbook',
          sheets: [{ source: simpleJsonSchema }],
        },
      ],
    })

    expect(results.workbooks[0].sheets[0].fields).toEqual(expectedResult)
  })

  it('should handle hierarchical schemas with $defs', async () => {
    const hierarchicalSchema = {
      $id: 'https://example.com/booking',
      type: 'object',
      properties: {
        import: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineItems: {
                type: 'array',
                items: { $ref: '#/$defs/CartLineItem' },
              },
            },
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
          required: ['lineId'],
        },
      },
    }

    const results = await generateSetup({
      workbooks: [
        {
          name: 'Test Workbook',
          sheets: [{ source: hierarchicalSchema }],
        },
      ],
    })

    expect(results.workbooks[0].sheets).toHaveLength(2)

    const cartLineItemSheet = results.workbooks[0].sheets.find(
      (s) => s.slug === 'CartLineItem'
    )
    expect(cartLineItemSheet).toBeDefined()
    expect(cartLineItemSheet.name).toBe('Cart Line Item')
    expect(cartLineItemSheet.fields).toHaveLength(2)
    expect(cartLineItemSheet.fields).toEqual([
      expect.objectContaining({
        key: 'lineId',
        type: 'string',
        label: 'Line Id',
        description: 'Unique identifier for a line item',
        constraints: [{ type: 'required' }],
      }),
      expect.objectContaining({
        key: 'productId',
        type: 'number',
        label: 'Product Id',
        description: 'Unique identifier of a Product',
      }),
    ])

    const mainSheet = results.workbooks[0].sheets.find((s) => s.slug === 'main')
    expect(mainSheet).toBeDefined()
    expect(mainSheet.fields).toEqual([
      expect.objectContaining({
        key: 'import_lineItems',
        type: 'reference-list',
        label: 'Import Line Items',
        config: { ref: 'CartLineItem', key: 'id' },
      }),
    ])
  })

  it('should handle complex hierarchical schemas with multiple $defs', async () => {
    const bookingSchema = {
      $id: 'https://example.com/booking-import',
      title: 'Booking Import',
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
                items: { $ref: '#/$defs/CartLineItem' },
                description: 'List of LineItems to book',
              },
              bookingFields: {
                type: 'array',
                items: { $ref: '#/$defs/CartFormField' },
                description: 'List of FormFields with their values',
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
              type: 'string',
              description:
                'Unique identifier for a line item. Must be greater than 0 and must start from 1.',
            },
            productId: {
              type: 'integer',
              description: 'Unique identifier of a Product',
            },
            start: {
              type: 'string',
              description: 'The date and time when the line item begins.',
            },
            end: {
              type: 'string',
              description: 'The date and time when the line item ends.',
            },
            pricing: { $ref: '#/$defs/LineItemPricing' },
          },
          required: ['lineId'],
        },
        CartFormField: {
          type: 'object',
          properties: {
            fieldId: {
              type: 'string',
              description: "The form field's identifier",
            },
            value: {
              type: 'string',
              description: 'The value entered for the field',
            },
          },
        },
        LineItemPricing: {
          type: 'object',
          properties: {
            subTotal: {
              type: 'number',
              description: 'The line item total cost, in cents',
            },
            inclusiveTaxTotal: {
              type: 'number',
              description:
                'The total of inclusive taxes (already in line item prices, eg. VAT), in cents',
            },
            taxTotal: {
              type: 'number',
              description: 'The total of additive taxes, in cents',
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

    expect(results.workbooks[0].sheets).toHaveLength(4)

    const sheetSlugs = results.workbooks[0].sheets.map((s) => s.slug)
    expect(sheetSlugs).toContain('CartLineItem')
    expect(sheetSlugs).toContain('CartFormField')
    expect(sheetSlugs).toContain('LineItemPricing')
    expect(sheetSlugs).toContain('main')

    const cartLineItemSheet = results.workbooks[0].sheets.find(
      (s) => s.slug === 'CartLineItem'
    )
    expect(cartLineItemSheet).toBeDefined()
    expect(cartLineItemSheet.name).toBe('Cart Line Item')
    expect(cartLineItemSheet.fields).toHaveLength(5)
    expect(cartLineItemSheet.fields).toEqual([
      expect.objectContaining({
        key: 'lineId',
        type: 'string',
        label: 'Line Id',
        description:
          'Unique identifier for a line item. Must be greater than 0 and must start from 1.',
      }),
      expect.objectContaining({
        key: 'productId',
        type: 'number',
        label: 'Product Id',
        description: 'Unique identifier of a Product',
      }),
      expect.objectContaining({
        key: 'start',
        type: 'string',
        label: 'Start',
        description: 'The date and time when the line item begins.',
      }),
      expect.objectContaining({
        key: 'end',
        type: 'string',
        label: 'End',
        description: 'The date and time when the line item ends.',
      }),
      expect.objectContaining({
        key: 'pricing',
        type: 'reference',
        label: 'Pricing',
        config: { ref: 'LineItemPricing', key: 'id' },
      }),
    ])

    const cartFormFieldSheet = results.workbooks[0].sheets.find(
      (s) => s.slug === 'CartFormField'
    )
    expect(cartFormFieldSheet).toBeDefined()
    expect(cartFormFieldSheet.name).toBe('Cart Form Field')
    expect(cartFormFieldSheet.fields).toHaveLength(2)
    expect(cartFormFieldSheet.fields).toEqual([
      expect.objectContaining({
        key: 'fieldId',
        type: 'string',
        label: 'Field Id',
        description: "The form field's identifier",
      }),
      expect.objectContaining({
        key: 'value',
        type: 'string',
        label: 'Value',
        description: 'The value entered for the field',
      }),
    ])

    const lineItemPricingSheet = results.workbooks[0].sheets.find(
      (s) => s.slug === 'LineItemPricing'
    )
    expect(lineItemPricingSheet).toBeDefined()
    expect(lineItemPricingSheet.name).toBe('Line Item Pricing')
    expect(lineItemPricingSheet.fields).toHaveLength(3)
    expect(lineItemPricingSheet.fields).toEqual([
      expect.objectContaining({
        key: 'subTotal',
        type: 'number',
        label: 'Sub Total',
        description: 'The line item total cost, in cents',
      }),
      expect.objectContaining({
        key: 'inclusiveTaxTotal',
        type: 'number',
        label: 'Inclusive Tax Total',
        description:
          'The total of inclusive taxes (already in line item prices, eg. VAT), in cents',
      }),
      expect.objectContaining({
        key: 'taxTotal',
        type: 'number',
        label: 'Tax Total',
        description: 'The total of additive taxes, in cents',
      }),
    ])

    const mainSheet = results.workbooks[0].sheets.find((s) => s.slug === 'main')
    expect(mainSheet).toBeDefined()
    expect(mainSheet.name).toBe('Booking Import')
    expect(mainSheet.fields).toHaveLength(3)
    expect(mainSheet.fields).toEqual([
      expect.objectContaining({
        key: 'import_originalBookingId',
        type: 'string',
        label: 'Import Original Booking Id',
        description: 'The original booking identifier',
        constraints: [{ type: 'required' }],
      }),
      expect.objectContaining({
        key: 'import_lineItems',
        type: 'reference-list',
        label: 'Import Line Items',
        description: 'List of LineItems to book',
        config: { ref: 'CartLineItem', key: 'id' },
        constraints: [{ type: 'required' }],
      }),
      expect.objectContaining({
        key: 'import_bookingFields',
        type: 'reference-list',
        label: 'Import Booking Fields',
        description: 'List of FormFields with their values',
        config: { ref: 'CartFormField', key: 'id' },
      }),
    ])
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
    const flatSheet = results.workbooks[0].sheets[0]
    expect(flatSheet.fields).toHaveLength(2)
    expect(flatSheet.fields).toEqual([
      expect.objectContaining({
        key: 'name',
        type: 'string',
        label: 'Name',
        description: 'Person name',
        constraints: [{ type: 'required' }],
      }),
      expect.objectContaining({
        key: 'age',
        type: 'number',
        label: 'Age',
        description: 'Person age',
      }),
    ])
  })
})
