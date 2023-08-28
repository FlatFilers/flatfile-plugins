import api from '@flatfile/api'
import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import { gettingStartedSheet } from '../ref/getting_started'
import { SetupFactory, configureSpace } from '.'

const setup: SetupFactory = {
  workbooks: [
    {
      name: 'Playground',
      labels: ['Swingset', 'Slide', 'See Saw', 'Monkey Bars'],
      sheets: [gettingStartedSheet],
      actions: [
        {
          operation: 'submitActionFg',
          mode: 'foreground',
          label: 'Submit data',
          type: 'string',
          description: 'Submit this data to a webhook.',
          primary: true,
        },
        {
          operation: 'duplicateWorkbook',
          mode: 'foreground',
          label: 'Duplicate',
          description: 'Duplicate this workbook.',
        },
      ],
    },
  ],
}

describe('SpaceConfigure plugin e2e tests', () => {
  const mockFn = jest.fn()
  const listener = setupListener()
  let spaceId: string

  beforeAll(async () => {
    listener.use(configureSpace(setup, mockFn))

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

    expect(workspace.data.name).toBe(setup.workbooks[0].name)
    expect(workspace.data.labels).toMatchObject(setup.workbooks[0].labels)
    expect(workspace.data.sheets[0].name).toBe(
      setup.workbooks[0].sheets[0].name
    )
    expect(workspace.data.sheets[0].config).toMatchObject(
      setup.workbooks[0].sheets[0]
    )
    expect(workspace.data.actions).toMatchObject(setup.workbooks[0].actions)
    expect(mockFn).toHaveBeenCalled()
  })
})
