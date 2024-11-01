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
            'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/752fbf24fc6aa4f3cd1a5b1b1247b82af8c91b6b/examples/v3.1/webhook-example.json',
          sheets: [{ model: 'Pet' }],
        },
      ],
    })

    expect(results).toMatchObject(expectedConfig)
  })
})
