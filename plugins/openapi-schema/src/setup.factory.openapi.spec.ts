import { describe, expect, it } from 'vitest'
import { generateSetup } from './setup.factory'

describe('generateSetup()', () => {
  const expectedConfig = {
    workbooks: [
      {
        name: 'Webhook Example',
        sheets: [
          {
            name: 'Pet',
            slug: 'Pet',
            fields: [
              {
                label: 'id',
                constraints: [{ type: 'required' }],
                key: 'id',
                type: 'number',
              },
              {
                label: 'name',
                constraints: [{ type: 'required' }],
                key: 'name',
                type: 'string',
              },
              { label: 'tag', key: 'tag', type: 'string' },
            ],
          },
        ],
      },
    ],
  }

  it('should generate a SetupFactory from OpenAPI Schema', async () => {
    const results = await generateSetup({
      workbooks: [
        {
          source:
            'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.1/webhook-example.json',
          sheets: [{ model: 'Pet' }],
        },
      ],
    })

    expect(results).toMatchObject(expectedConfig)
  })
})
