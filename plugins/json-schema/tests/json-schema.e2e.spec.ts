import api from '@flatfile/api'
import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import express from 'express'
import { configureSpaceWithJsonSchema, fetchExternalReference } from '../src'
import { startServer, stopServer } from './test-server/server'

const app = express()
const port = 8080
const url = `http://localhost:${port}/`

let server

describe('configureSpaceWithJsonSchema() e2e', () => {
  const pureDataSchema = {
    $id: 'https://localhost:3000/json',
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

  const expectedWorkbookData = {
    name: 'JSON Schema Workbook',
    labels: [],
    sheets: [
      {
        name: 'ExampleData',
        config: {
          name: 'ExampleData',
          description:
            'A basic set of JSON Schema to test data type conversions simply',
          fields: [
            {
              type: 'string',
              key: 'stringColumn',
              label: 'stringColumn',
              description: 'A column for strings!',
            },
            {
              type: 'number',
              key: 'integerColumn',
              label: 'integerColumn',
              description: 'A column for integers!',
            },
            {
              type: 'enum',
              config: { options: [] },
              key: 'arrayColumn',
              label: 'arrayColumn',
              description: 'An enum of Selected Values',
            },
            {
              type: 'number',
              key: 'objectColumn_nestedUniqueNumberColumn',
              label: 'objectColumn_nestedUniqueNumberColumn',
              description: 'A column for unique numbers!',
            },
            {
              type: 'string',
              key: 'objectColumn_nestedStringColumn',
              label: 'objectColumn_nestedStringColumn',
            },
          ],
        },
      },
    ],
  }

  let spaceId: string
  const listener = setupListener()

  beforeAll(async () => {
    console.log(`Starting temporary server on port ${port}`)
    server = startServer(app, port, pureDataSchema)
    console.log('Setting up Space and Retrieving spaceId')

    await listener.use(
      configureSpaceWithJsonSchema({
        workbooks: [
          {
            name: 'JSON Schema Workbook',
            sheets: [
              {
                jsonModel: async () => await fetchExternalReference(url),
              },
            ],
          },
        ],
      })
    )

    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    stopServer(server)
    await deleteSpace(spaceId)
  })

  it('should configure a space and correctly format and flatten the JSON Schema', async () => {
    console.log('starting configuration')
    await listener.waitFor('job:ready', 1, 'space:configure')

    const space = await api.spaces.get(spaceId)
    const workspace = await api.workbooks.get(space.data.primaryWorkbookId)
    const workspaceData = workspace.data

    expect(workspaceData.name).toBe(expectedWorkbookData.name)
    expect(workspaceData.sheets[0].config).toMatchObject(
      expectedWorkbookData.sheets[0].config
    )
  })
})
