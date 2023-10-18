import api from '@flatfile/api'
import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import { configureSpaceWithOpenAPI } from '.'

const expectedConfig = {
  name: 'Pet',
  fields: [
    {
      type: 'number',
      config: {},
      key: 'id',
      label: 'id',
      description: 'undefined',
      constraints: [{ type: 'required' }],
      readonly: false,
    },
    {
      type: 'string',
      key: 'name',
      label: 'name',
      description: 'undefined',
      constraints: [{ type: 'required' }],
      readonly: false,
    },
    {
      type: 'string',
      key: 'tag',
      label: 'tag',
      description: 'undefined',
      readonly: false,
    },
  ],
}

describe('SpaceConfigure plugin e2e tests', () => {
  const mockFn = jest.fn()
  const listener = setupListener()
  let spaceId: string

  beforeAll(async () => {
    listener.use(
      configureSpaceWithOpenAPI(
        'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.1/webhook-example.json',
        undefined,
        mockFn
      )
    )

    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
  })

  it('should configure a space & run callback', async () => {
    await listener.waitFor('job:ready', 1, 'space:configure')

    const space = await api.spaces.get(spaceId)
    const workspace = await api.workbooks.get(space.data.primaryWorkbookId)
    console.dir(workspace, { depth: null })

    expect(workspace.data.name).toBe('Webhook Example')
    expect(workspace.data.sheets[0].name).toBe('Pet')
    expect(workspace.data.sheets[0].config).toMatchObject(expectedConfig)
    expect(mockFn).toHaveBeenCalled()
  })
})
