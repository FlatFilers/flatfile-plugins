import { FlatfileClient } from '@flatfile/api'
import {
  deleteSpace,
  setupDriver,
  setupSpace,
  TestListener,
} from '@flatfile/utils-testing'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { SetupFactory } from '.'
import { reconfigureSpace } from '.'

const api = new FlatfileClient()

// Simple reconfigure setup
const simpleSetup: SetupFactory = {
  workbooks: [
    {
      name: 'Simple Test Workbook',
      sheets: [
        {
          name: 'Test Sheet',
          slug: 'test-sheet',
          fields: [
            {
              key: 'testField',
              type: 'string',
              label: 'Test Field',
            },
          ],
        },
      ],
    },
  ],
}

describe('SpaceReconfigure simple e2e test', () => {
  const mockFn = vi.fn()
  const listener = new TestListener()
  const driver = setupDriver()
  let spaceId: string

  beforeAll(async () => {
    await driver.start()
    listener.mount(driver)
    listener.use(reconfigureSpace(simpleSetup, mockFn))
    const space = await setupSpace()
    spaceId = space.id
  })

  afterAll(async () => {
    await deleteSpace(spaceId)
    driver.shutdown()
  })

  it('should reconfigure a space', async () => {
    await listener.waitFor('job:ready', 1, 'space:reconfigure')

    const workbooksList = await api.workbooks.list({ spaceId })
    const workbooks = workbooksList.data

    expect(workbooks).toHaveLength(1)
    expect(workbooks[0].name).toBe('Simple Test Workbook')
    expect(workbooks[0].sheets![0].name).toBe('Test Sheet')
    expect(mockFn).toHaveBeenCalled()
  })
})
