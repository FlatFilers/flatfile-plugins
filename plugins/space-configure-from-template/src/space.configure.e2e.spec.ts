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
import { configureSpaceFromTemplate } from '.'

const api = new FlatfileClient()

describe('SpaceConfigureFromTemplate plugin e2e tests', () => {
  const mockFn = vi.fn()
  const listener = new TestListener()
  const driver = setupDriver()
  let spaceId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

    listener.use(configureSpaceFromTemplate(mockFn))

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

    // expect(workspace.data.name).toBe(setup.workbooks[0].name)
    // expect(workspace.data.labels).toMatchObject(setup.workbooks[0].labels!)
    // expect(workspace.data.sheets![0].name).toBe(
    //   setup.workbooks[0].sheets![0].name
    // )
    // expect(workspace.data.sheets![0].config).toMatchObject(
    //   setup.workbooks[0].sheets![0]
    // )
    // expect(workspace.data.actions).toMatchObject(setup.workbooks[0].actions!)
    // expect(mockFn).toHaveBeenCalled()
  })
})
