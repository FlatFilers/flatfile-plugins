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
import { configureSpace } from '@flatfile/plugin-space-configure'
import { reconfigureSpace } from '.'
import { contactsSheet, updatedContactsSheet, companiesSheet } from '../ref/test-sheets'

const api = new FlatfileClient()

// Initial setup configuration
const initialSetup: SetupFactory = {
  workbooks: [
    {
      name: 'Test Workbook',
      labels: ['initial'],
      sheets: [contactsSheet],
      actions: [
        {
          operation: 'initialAction',
          mode: 'foreground',
          label: 'Initial Action',
          description: 'Initial test action',
        },
      ],
    },
  ],
}

// Reconfigure setup - updates existing workbook and adds new one
const reconfigureSetup: SetupFactory = {
  workbooks: [
    {
      name: 'Test Workbook', // This should update the existing workbook
      labels: ['updated'],
      sheets: [updatedContactsSheet],
      actions: [
        {
          operation: 'updatedAction',
          mode: 'foreground',
          label: 'Updated Action',
          description: 'Updated test action',
          primary: true,
        },
      ],
    },
    {
      name: 'New Companies Workbook', // This should create a new workbook
      labels: ['new'],
      sheets: [companiesSheet],
      actions: [
        {
          operation: 'newAction',
          mode: 'background',
          label: 'New Action',
          description: 'New workbook action',
        },
      ],
    },
  ],
  space: {
    metadata: {
      theme: {
        root: {
          primaryColor: 'blue',
        },
      },
    },
  },
  config: {
    maintainWorkbookOrder: true,
  },
}

describe('SpaceReconfigure plugin e2e tests', () => {
  const mockConfigureFn = vi.fn()
  const mockReconfigureFn = vi.fn()
  const listener = new TestListener()
  const driver = setupDriver()
  let spaceId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)

    // Set up both plugins
    listener.use(configureSpace(initialSetup, mockConfigureFn))
    listener.use(reconfigureSpace(reconfigureSetup, mockReconfigureFn))

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

  it('should initially configure a space', async () => {
    await listener.waitFor('job:ready', 1, 'space:configure')

    const space = await api.spaces.get(spaceId)
    const workbook = await api.workbooks.get(space.data.primaryWorkbookId!)

    expect(workbook.data.name).toBe('Test Workbook')
    expect(workbook.data.labels).toContain('initial')
    expect(workbook.data.sheets![0].name).toBe('Contacts')
    expect(workbook.data.sheets![0].config.fields).toHaveLength(3) // firstName, lastName, email
    expect(mockConfigureFn).toHaveBeenCalled()
  })

  it('should reconfigure existing workbook and create new one', async () => {
    await listener.waitFor('job:ready', 1, 'space:reconfigure')

    const space = await api.spaces.get(spaceId)
    const workbooksList = await api.workbooks.list({ spaceId })
    const workbooks = workbooksList.data

    // Should have 2 workbooks now
    expect(workbooks).toHaveLength(2)

    // Find the updated workbook
    const updatedWorkbook = workbooks.find(wb => wb.name === 'Test Workbook')
    expect(updatedWorkbook).toBeDefined()
    expect(updatedWorkbook!.labels).toContain('updated')
    expect(updatedWorkbook!.sheets![0].config.fields).toHaveLength(4) // firstName, lastName, email, phone

    // Find the new workbook
    const newWorkbook = workbooks.find(wb => wb.name === 'New Companies Workbook')
    expect(newWorkbook).toBeDefined()
    expect(newWorkbook!.labels).toContain('new')
    expect(newWorkbook!.sheets![0].name).toBe('Companies')
    expect(newWorkbook!.sheets![0].config.fields).toHaveLength(2) // name, website

    // Check space metadata was updated
    expect(space.data.metadata?.theme?.root?.primaryColor).toBe('blue')

    // Check workbook order is maintained
    expect(space.data.settings?.sidebarConfig?.workbookSidebarOrder).toBeDefined()
    expect(space.data.settings?.sidebarConfig?.workbookSidebarOrder).toHaveLength(2)

    expect(mockReconfigureFn).toHaveBeenCalled()
  })

  it('should handle workbook matching by name', async () => {
    // Create a setup that matches by name
    const matchingSetup: SetupFactory = {
      workbooks: [
        {
          name: 'Test Workbook', // Should match existing workbook
          labels: ['matched-by-name'],
          sheets: [
            {
              name: 'Updated Contacts',
              slug: 'updated-contacts',
              fields: [
                {
                  key: 'fullName',
                  type: 'string',
                  label: 'Full Name',
                },
              ],
            },
          ],
        },
      ],
    }

    const matchingListener = new TestListener()
    matchingListener.mount(driver)
    matchingListener.use(reconfigureSpace(matchingSetup))

    await matchingListener.waitFor('job:ready', 1, 'space:reconfigure')

    const workbooksList = await api.workbooks.list({ spaceId })
    const workbooks = workbooksList.data

    // Should still have 2 workbooks (1 updated, 1 unchanged)
    expect(workbooks).toHaveLength(2)

    const matchedWorkbook = workbooks.find(wb => wb.name === 'Test Workbook')
    expect(matchedWorkbook).toBeDefined()
    expect(matchedWorkbook!.labels).toContain('matched-by-name')
    expect(matchedWorkbook!.sheets![0].name).toBe('Updated Contacts')

    matchingListener.reset()
  })

  it('should create new workbook when no match found', async () => {
    const newWorkbookSetup: SetupFactory = {
      workbooks: [
        {
          name: 'Completely New Workbook', // Should create new workbook
          labels: ['brand-new'],
          sheets: [
            {
              name: 'New Sheet',
              slug: 'new-sheet',
              fields: [
                {
                  key: 'data',
                  type: 'string',
                  label: 'Data',
                },
              ],
            },
          ],
        },
      ],
    }

    const newWorkbookListener = new TestListener()
    newWorkbookListener.mount(driver)
    newWorkbookListener.use(reconfigureSpace(newWorkbookSetup))

    await newWorkbookListener.waitFor('job:ready', 1, 'space:reconfigure')

    const workbooksList = await api.workbooks.list({ spaceId })
    const workbooks = workbooksList.data

    // Should have 3 workbooks now
    expect(workbooks).toHaveLength(3)

    const newWorkbook = workbooks.find(wb => wb.name === 'Completely New Workbook')
    expect(newWorkbook).toBeDefined()
    expect(newWorkbook!.labels).toContain('brand-new')
    expect(newWorkbook!.sheets![0].name).toBe('New Sheet')

    newWorkbookListener.reset()
  })

  it('should handle callback function with workbook IDs', async () => {
    const callbackSetup: SetupFactory = {
      workbooks: [
        {
          name: 'Callback Test Workbook',
          sheets: [contactsSheet],
        },
      ],
    }

    const callbackMock = vi.fn()
    const callbackListener = new TestListener()
    callbackListener.mount(driver)
    callbackListener.use(reconfigureSpace(callbackSetup, callbackMock))

    await callbackListener.waitFor('job:ready', 1, 'space:reconfigure')

    expect(callbackMock).toHaveBeenCalled()
    expect(callbackMock).toHaveBeenCalledWith(
      expect.any(Object), // event
      expect.any(Array),  // workbookIds
      expect.any(Function) // tick
    )

    const [, workbookIds] = callbackMock.mock.calls[0]
    expect(workbookIds).toHaveLength(1)
    expect(typeof workbookIds[0]).toBe('string')

    callbackListener.reset()
  })

  it('should delete workbooks that are not in the new configuration', async () => {
    // First ensure we have multiple workbooks
    const setupWithMultipleWorkbooks: SetupFactory = {
      workbooks: [
        {
          name: 'Workbook A',
          sheets: [contactsSheet],
        },
        {
          name: 'Workbook B',
          sheets: [companiesSheet],
        },
      ],
    }

    const multipleWorkbooksListener = new TestListener()
    multipleWorkbooksListener.mount(driver)
    multipleWorkbooksListener.use(reconfigureSpace(setupWithMultipleWorkbooks))

    await multipleWorkbooksListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify we have 2 workbooks
    let workbooksList = await api.workbooks.list({ spaceId })
    expect(workbooksList.data.length).toBeGreaterThanOrEqual(2)

    // Now reconfigure with only one workbook
    const setupWithOneWorkbook: SetupFactory = {
      workbooks: [
        {
          name: 'Workbook A', // Keep this one
          sheets: [updatedContactsSheet],
        },
        // Workbook B should be deleted
      ],
    }

    const deletionListener = new TestListener()
    deletionListener.mount(driver)
    deletionListener.use(reconfigureSpace(setupWithOneWorkbook))

    await deletionListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify only one workbook remains
    workbooksList = await api.workbooks.list({ spaceId })
    const remainingWorkbooks = workbooksList.data

    expect(remainingWorkbooks.length).toBeLessThan(2)
    
    // Verify the correct workbook remains
    const workbookA = remainingWorkbooks.find(wb => wb.name === 'Workbook A')
    expect(workbookA).toBeDefined()
    expect(workbookA!.sheets![0].name).toBe('Contacts')

    // Verify the other workbook is gone
    const workbookB = remainingWorkbooks.find(wb => wb.name === 'Workbook B')
    expect(workbookB).toBeUndefined()

    multipleWorkbooksListener.reset()
    deletionListener.reset()
  })
})
