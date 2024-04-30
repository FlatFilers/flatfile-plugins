import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from 'bun:test'
import { jobHandler } from '.'

describe('JobHandler plugin e2e tests', () => {
  describe('jobHandler() successful', () => {
    const listener = setupListener()
    const mockFn = mock()
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
    const logErrorSpy = spyOn(global.console, 'error')
    const listener = setupListener()
    const mockErrorFn = mock(() => {
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
