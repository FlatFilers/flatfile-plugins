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

  it('should handle document CRUD operations', async () => {
    // First, create some initial documents
    const initialDocumentsSetup: SetupFactory = {
      workbooks: [
        {
          name: 'Document Test Workbook',
          sheets: [contactsSheet],
        },
      ],
      documents: [
        {
          title: 'Welcome Document',
          body: '<h1>Welcome to our platform</h1>',
        },
        {
          title: 'API Guide',
          body: '<h1>API Documentation</h1>',
        },
      ],
    }

    const initialDocumentsListener = new TestListener()
    initialDocumentsListener.mount(driver)
    initialDocumentsListener.use(reconfigureSpace(initialDocumentsSetup))

    await initialDocumentsListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify initial documents were created
    let documentsList = await api.documents.list(spaceId)
    expect(documentsList.data.length).toBeGreaterThanOrEqual(2)

    const welcomeDoc = documentsList.data.find(doc => doc.title === 'Welcome Document')
    const apiDoc = documentsList.data.find(doc => doc.title === 'API Guide')
    expect(welcomeDoc).toBeDefined()
    expect(apiDoc).toBeDefined()

    // Now reconfigure with updated, deleted, and new documents
    const updatedDocumentsSetup: SetupFactory = {
      workbooks: [
        {
          name: 'Document Test Workbook',
          sheets: [contactsSheet],
        },
      ],
      documents: [
        {
          title: 'Welcome Document', // Update this one
          body: '<h1>Welcome to our UPDATED platform</h1><p>New content added</p>',
        },
        // API Guide should be deleted (not in new config)
        {
          title: 'New User Manual', // Create this new one
          body: '<h1>User Manual</h1><p>Step-by-step guide</p>',
        },
      ],
    }

    const updatedDocumentsListener = new TestListener()
    updatedDocumentsListener.mount(driver)
    updatedDocumentsListener.use(reconfigureSpace(updatedDocumentsSetup))

    await updatedDocumentsListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify document CRUD operations
    documentsList = await api.documents.list(spaceId)
    const finalDocuments = documentsList.data

    // Should have 2 documents (1 updated, 1 new)
    expect(finalDocuments).toHaveLength(2)

    // Check updated document
    const updatedWelcomeDoc = finalDocuments.find(doc => doc.title === 'Welcome Document')
    expect(updatedWelcomeDoc).toBeDefined()
    expect(updatedWelcomeDoc!.body).toContain('UPDATED platform')
    expect(updatedWelcomeDoc!.body).toContain('New content added')

    // Check new document
    const newManualDoc = finalDocuments.find(doc => doc.title === 'New User Manual')
    expect(newManualDoc).toBeDefined()
    expect(newManualDoc!.body).toContain('User Manual')

    // Check deleted document
    const deletedApiDoc = finalDocuments.find(doc => doc.title === 'API Guide')
    expect(deletedApiDoc).toBeUndefined()

    initialDocumentsListener.reset()
    updatedDocumentsListener.reset()
  })

  it('should delete all documents when none in configuration', async () => {
    // First, create some documents
    const setupWithDocuments: SetupFactory = {
      workbooks: [
        {
          name: 'Test Workbook',
          sheets: [contactsSheet],
        },
      ],
      documents: [
        {
          title: 'Document 1',
          body: '<h1>Document 1</h1>',
        },
        {
          title: 'Document 2',
          body: '<h1>Document 2</h1>',
        },
      ],
    }

    const withDocumentsListener = new TestListener()
    withDocumentsListener.mount(driver)
    withDocumentsListener.use(reconfigureSpace(setupWithDocuments))

    await withDocumentsListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify documents exist
    let documentsList = await api.documents.list(spaceId)
    expect(documentsList.data.length).toBeGreaterThanOrEqual(2)

    // Now reconfigure with NO documents
    const setupWithoutDocuments: SetupFactory = {
      workbooks: [
        {
          name: 'Test Workbook',
          sheets: [contactsSheet],
        },
      ],
      // No documents property - should delete all existing documents
    }

    const withoutDocumentsListener = new TestListener()
    withoutDocumentsListener.mount(driver)
    withoutDocumentsListener.use(reconfigureSpace(setupWithoutDocuments))

    await withoutDocumentsListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify all documents were deleted
    documentsList = await api.documents.list(spaceId)
    expect(documentsList.data).toHaveLength(0)

    withDocumentsListener.reset()
    withoutDocumentsListener.reset()
  })

  it('should maintain workbook order when workbooks are deleted', async () => {
    // First, create multiple workbooks with maintainWorkbookOrder
    const setupWithOrderedWorkbooks: SetupFactory = {
      workbooks: [
        {
          name: 'Workbook A',
          sheets: [contactsSheet],
        },
        {
          name: 'Workbook B',
          sheets: [companiesSheet],
        },
        {
          name: 'Workbook C',
          sheets: [updatedContactsSheet],
        },
      ],
      config: {
        maintainWorkbookOrder: true,
      },
    }

    const orderedWorkbooksListener = new TestListener()
    orderedWorkbooksListener.mount(driver)
    orderedWorkbooksListener.use(reconfigureSpace(setupWithOrderedWorkbooks))

    await orderedWorkbooksListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify workbook order is set
    let space = await api.spaces.get(spaceId)
    expect(space.data.settings?.sidebarConfig?.workbookSidebarOrder).toBeDefined()
    expect(space.data.settings?.sidebarConfig?.workbookSidebarOrder).toHaveLength(3)

    // Now reconfigure with fewer workbooks, maintaining order
    const setupWithFewerWorkbooks: SetupFactory = {
      workbooks: [
        {
          name: 'Workbook A', // Keep
          sheets: [contactsSheet],
        },
        {
          name: 'Workbook C', // Keep
          sheets: [updatedContactsSheet],
        },
        // Workbook B should be deleted
      ],
      config: {
        maintainWorkbookOrder: true,
      },
    }

    const fewerWorkbooksListener = new TestListener()
    fewerWorkbooksListener.mount(driver)
    fewerWorkbooksListener.use(reconfigureSpace(setupWithFewerWorkbooks))

    await fewerWorkbooksListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify workbook order is updated correctly
    space = await api.spaces.get(spaceId)
    const workbookOrder = space.data.settings?.sidebarConfig?.workbookSidebarOrder
    expect(workbookOrder).toBeDefined()
    expect(workbookOrder).toHaveLength(2)

    // Verify remaining workbooks exist
    const workbooksList = await api.workbooks.list({ spaceId })
    const workbooks = workbooksList.data
    expect(workbooks).toHaveLength(2)
    expect(workbooks.find(wb => wb.name === 'Workbook A')).toBeDefined()
    expect(workbooks.find(wb => wb.name === 'Workbook C')).toBeDefined()
    expect(workbooks.find(wb => wb.name === 'Workbook B')).toBeUndefined()

    orderedWorkbooksListener.reset()
    fewerWorkbooksListener.reset()
  })

  it('should handle complete space reconfiguration with all resource types', async () => {
    // Create initial comprehensive setup
    const initialComprehensiveSetup: SetupFactory = {
      workbooks: [
        {
          name: 'Initial Workbook 1',
          sheets: [contactsSheet],
        },
        {
          name: 'Initial Workbook 2',
          sheets: [companiesSheet],
        },
      ],
      documents: [
        {
          title: 'Initial Doc 1',
          body: '<h1>Initial Document 1</h1>',
        },
        {
          title: 'Initial Doc 2',
          body: '<h1>Initial Document 2</h1>',
        },
      ],
      space: {
        metadata: {
          theme: {
            root: {
              primaryColor: 'red',
            },
          },
        },
      },
      config: {
        maintainWorkbookOrder: true,
      },
    }

    const initialComprehensiveListener = new TestListener()
    initialComprehensiveListener.mount(driver)
    initialComprehensiveListener.use(reconfigureSpace(initialComprehensiveSetup))

    await initialComprehensiveListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify initial state
    let workbooksList = await api.workbooks.list({ spaceId })
    let documentsList = await api.documents.list(spaceId)
    let space = await api.spaces.get(spaceId)

    expect(workbooksList.data).toHaveLength(2)
    expect(documentsList.data).toHaveLength(2)
    expect(space.data.metadata?.theme?.root?.primaryColor).toBe('red')

    // Now completely reconfigure with different resources
    const newComprehensiveSetup: SetupFactory = {
      workbooks: [
        {
          name: 'Initial Workbook 1', // Update this one
          sheets: [updatedContactsSheet],
        },
        {
          name: 'New Workbook 3', // Create new one
          sheets: [companiesSheet],
        },
        // Initial Workbook 2 should be deleted
      ],
      documents: [
        {
          title: 'Initial Doc 1', // Update this one
          body: '<h1>Updated Document 1</h1><p>New content</p>',
        },
        {
          title: 'New Doc 3', // Create new one
          body: '<h1>New Document 3</h1>',
        },
        // Initial Doc 2 should be deleted
      ],
      space: {
        metadata: {
          theme: {
            root: {
              primaryColor: 'green',
            },
          },
        },
      },
      config: {
        maintainWorkbookOrder: true,
      },
    }

    const newComprehensiveListener = new TestListener()
    newComprehensiveListener.mount(driver)
    newComprehensiveListener.use(reconfigureSpace(newComprehensiveSetup))

    await newComprehensiveListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify final state
    workbooksList = await api.workbooks.list({ spaceId })
    documentsList = await api.documents.list(spaceId)
    space = await api.spaces.get(spaceId)

    // Check workbooks
    expect(workbooksList.data).toHaveLength(2)
    const workbook1 = workbooksList.data.find(wb => wb.name === 'Initial Workbook 1')
    const workbook3 = workbooksList.data.find(wb => wb.name === 'New Workbook 3')
    const workbook2 = workbooksList.data.find(wb => wb.name === 'Initial Workbook 2')
    
    expect(workbook1).toBeDefined()
    expect(workbook3).toBeDefined()
    expect(workbook2).toBeUndefined()

    // Check documents
    expect(documentsList.data).toHaveLength(2)
    const doc1 = documentsList.data.find(doc => doc.title === 'Initial Doc 1')
    const doc3 = documentsList.data.find(doc => doc.title === 'New Doc 3')
    const doc2 = documentsList.data.find(doc => doc.title === 'Initial Doc 2')
    
    expect(doc1).toBeDefined()
    expect(doc1!.body).toContain('Updated Document 1')
    expect(doc3).toBeDefined()
    expect(doc2).toBeUndefined()

    // Check space settings
    expect(space.data.metadata?.theme?.root?.primaryColor).toBe('green')
    expect(space.data.settings?.sidebarConfig?.workbookSidebarOrder).toHaveLength(2)

    initialComprehensiveListener.reset()
    newComprehensiveListener.reset()
  })

  it('should handle empty configuration (delete everything)', async () => {
    // First create some resources
    const setupWithResources: SetupFactory = {
      workbooks: [
        {
          name: 'Test Workbook',
          sheets: [contactsSheet],
        },
      ],
      documents: [
        {
          title: 'Test Document',
          body: '<h1>Test</h1>',
        },
      ],
    }

    const withResourcesListener = new TestListener()
    withResourcesListener.mount(driver)
    withResourcesListener.use(reconfigureSpace(setupWithResources))

    await withResourcesListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify resources exist
    let workbooksList = await api.workbooks.list({ spaceId })
    let documentsList = await api.documents.list(spaceId)
    expect(workbooksList.data.length).toBeGreaterThan(0)
    expect(documentsList.data.length).toBeGreaterThan(0)

    // Now reconfigure with empty setup
    const emptySetup: SetupFactory = {
      workbooks: [],
      documents: [],
    }

    const emptyListener = new TestListener()
    emptyListener.mount(driver)
    emptyListener.use(reconfigureSpace(emptySetup))

    await emptyListener.waitFor('job:ready', 1, 'space:reconfigure')

    // Verify everything is deleted
    workbooksList = await api.workbooks.list({ spaceId })
    documentsList = await api.documents.list(spaceId)
    expect(workbooksList.data).toHaveLength(0)
    expect(documentsList.data).toHaveLength(0)

    withResourcesListener.reset()
    emptyListener.reset()
  })
})
