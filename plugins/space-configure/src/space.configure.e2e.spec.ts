import { FlatfileClient } from '@flatfile/api'
import {
  deleteSpace,
  setupDriver,
  setupSpace,
  TestListener,
} from '@flatfile/utils-testing'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { SetupFactory } from '.'
import { configureSpace } from '.'
import { gettingStartedSheet } from '../ref/getting_started'

const api = new FlatfileClient()

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
  const mockFn = vi.fn()
  const listener = new TestListener()
  const driver = setupDriver()
  let spaceId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

    listener.use(configureSpace(setup, mockFn))

    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()
  })

  afterEach(() => {
    listener.reset()
  })

  it('should configure a space & run callback', async () => {
    await listener.waitFor('job:ready', 1, 'space:configure')

    const space = await api.spaces.get(spaceId)
    const workspace = await api.workbooks.get(space.data.primaryWorkbookId!)

    expect(workspace.data.name).toBe(setup.workbooks[0].name)
    expect(workspace.data.labels).toMatchObject(setup.workbooks[0].labels!)
    expect(workspace.data.sheets![0].name).toBe(
      setup.workbooks[0].sheets![0].name
    )
    expect(workspace.data.sheets![0].config).toMatchObject(
      setup.workbooks[0].sheets![0]
    )
    expect(workspace.data.actions).toMatchObject(setup.workbooks[0].actions!)
    expect(mockFn).toHaveBeenCalled()
  })
})

describe('SpaceConfigure plugin with maintainWorkbookOrder', () => {
  const listener = new TestListener()
  const driver = setupDriver()
  let spaceId: string
  let createdWorkbookIds: string[] = []

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

    const setupWithOrder: SetupFactory = {
      workbooks: [
        {
          name: 'First Workbook',
          sheets: [gettingStartedSheet],
        },
        {
          name: 'Second Workbook',
          sheets: [gettingStartedSheet],
        },
        {
          name: 'Third Workbook',
          sheets: [gettingStartedSheet],
        },
      ],
      config: {
        maintainWorkbookOrder: true,
      },
    }

    listener.use(
      configureSpace(setupWithOrder, async (event, workbookIds) => {
        createdWorkbookIds = workbookIds
      })
    )

    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()
  })

  afterEach(() => {
    listener.reset()
  })

  it('should maintain workbook order in sidebar config', async () => {
    await listener.waitFor('job:ready', 1, 'space:configure')

    const space = await api.spaces.get(spaceId)

    expect(
      space.data.settings?.sidebarConfig?.workbookSidebarOrder
    ).toBeDefined()
    expect(
      space.data.settings?.sidebarConfig?.workbookSidebarOrder
    ).toHaveLength(3)

    expect(space.data.settings?.sidebarConfig?.workbookSidebarOrder).toEqual(
      createdWorkbookIds
    )
  })
})

describe('SpaceConfigure plugin with maintainWorkbookOrder and existing settings', () => {
  const listener = new TestListener()
  const driver = setupDriver()
  let spaceId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

    const setupWithExistingSettings: SetupFactory = {
      workbooks: [
        {
          name: 'Workbook A',
          sheets: [gettingStartedSheet],
        },
        {
          name: 'Workbook B',
          sheets: [gettingStartedSheet],
        },
      ],
      space: {
        settings: {
          filesMappedAfterJob: 'custom-job',
        },
      },
      config: {
        maintainWorkbookOrder: true,
      },
    }

    listener.use(configureSpace(setupWithExistingSettings))

    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)

    driver.shutdown()
  })

  beforeEach(() => {
    listener.resetCount()
  })

  afterEach(() => {
    listener.reset()
  })

  it('should preserve existing settings while adding workbook order', async () => {
    await listener.waitFor('job:ready', 1, 'space:configure')

    const space = await api.spaces.get(spaceId)

    expect(
      space.data.settings?.sidebarConfig?.workbookSidebarOrder
    ).toBeDefined()
    expect(
      space.data.settings?.sidebarConfig?.workbookSidebarOrder
    ).toHaveLength(2)
    expect(space.data.settings?.filesMappedAfterJob).toBe('custom-job')
  })
})
