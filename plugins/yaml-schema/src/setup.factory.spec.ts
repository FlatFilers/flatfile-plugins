import { beforeEach, describe, expect, it } from 'bun:test'
import fetchMock from 'fetch-mock'
import fs from 'fs'
import path from 'path'
import { generateSetup } from '.'

describe('configureSpaceWithYamlSchema() e2e', () => {
  const expectedResult = {
    workbooks: [
      {
        name: 'YAML Schema Workbook',
        sheets: [
          {
            name: 'ExampleData',
            description:
              'A basic set of YAML Schema to test data type conversions simply',
            fields: [
              {
                label: 'stringColumn',
                description: 'A column for strings!',
                key: 'stringColumn',
                type: 'string',
              },
              {
                label: 'integerColumn',
                description: 'A column for integers!',
                key: 'integerColumn',
                type: 'number',
              },
              {
                label: 'arrayColumn',
                description: 'An enum of Selected Values',
                key: 'arrayColumn',
                type: 'enum',
                config: { options: [] },
              },
              {
                label: 'objectColumn_nestedUniqueNumberColumn',
                description: 'A column for unique numbers!',
                key: 'objectColumn_nestedUniqueNumberColumn',
                type: 'number',
              },
              {
                label: 'objectColumn_nestedStringColumn',
                key: 'objectColumn_nestedStringColumn',
                type: 'string',
              },
            ],
          },
        ],
      },
    ],
  }

  it('should generate a SetupFactory from YAML Schema', async () => {
    const schema = fs.readFileSync(
      path.resolve(__dirname, 'mock/schema.yml'),
      'utf-8'
    )
    fetchMock.mock('http://example.com/schema.yaml', {
      body: schema,
      status: 200,
    })

    const results = await generateSetup([
      {
        sourceUrl: 'http://example.com/schema.yaml',
      },
    ])

    expect(results).toMatchObject(expectedResult)
    fetchMock.restore()
  })
})
