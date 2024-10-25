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
  test,
  vi,
} from 'vitest'
import { jobHandler } from '.'

describe('JobHandler plugin e2e tests', () => {
  describe('jobHandler() successful', () => {
    const listener = new TestListener()
    const driver = setupDriver()

    beforeAll(async () => {
      await driver.start()
      listener.mount(driver)
    })

    afterAll(() => {
      driver.shutdown()
    })

    beforeEach(() => {
      listener.resetCount()
    })

    afterEach(() => {
      listener.reset()
    })

    const mockFn = vi.fn()
    let spaceId: string

    beforeAll(async () => {
      listener.use(jobHandler('space:configure', mockFn))

      const space = await setupSpace()
      spaceId = space.id
    })

    afterAll(async () => {
      await deleteSpace(spaceId)
    })

    test('jobHandler()', async () => {
      await listener.waitFor('job:ready', 1, 'space:configure')

      expect(mockFn).toHaveBeenCalled()
    })
  })

  describe('jobHandler() failure', () => {
    const listener = new TestListener()
    const driver = setupDriver()

    beforeAll(async () => {
      await driver.start()
      listener.mount(driver)
    })

    afterAll(() => {
      driver.shutdown()
    })

    beforeEach(() => {
      listener.resetCount()
    })

    afterEach(() => {
      listener.reset()
    })

    const logErrorSpy = vi.spyOn(global.console, 'error')
    const mockErrorFn = vi.fn(() => {
      throw new Error('trigger job:failed')
    })
    let spaceId: string

    beforeAll(async () => {
      listener.on('job:failed', (event) => {
        console.log(event.topic, event.payload.job)
      })
      listener.use(jobHandler('space:configure', mockErrorFn))

      const space = await setupSpace()
      spaceId = space.id
    })

    afterAll(async () => {
      await deleteSpace(spaceId)
    })

    test('job:failed', async () => {
      await listener.waitFor('job:failed', 1, 'space:configure')

      expect(logErrorSpy).toHaveBeenCalledWith(
        '[@flatfile/plugin-job-handler]:[FATAL] trigger job:failed'
      )
      expect(mockErrorFn).toThrow()
    })
  })
})
