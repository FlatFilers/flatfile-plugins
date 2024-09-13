import api, { Flatfile } from '@flatfile/api'
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
    const logErrorSpy = spyOn(global.console, 'error')
    const listener = setupListener()
    const mockFn = mock()
    const mockErrorFn = mock(() => {
      throw new Error('trigger job:failed')
    })
    let spaceId: string

    beforeAll(async () => {
      const space = await setupSpace()
      spaceId = space.id

      listener.use(jobHandler({ operation: 'job-handler-success' }, mockFn))

      listener.on('job:failed', (event) => {
        console.log(event.topic, event.payload.job)
      })
      listener.use(jobHandler({ operation: 'job-handler-failure' }, mockErrorFn))

      const { data: successJob } = await api.jobs.create({
        type: Flatfile.JobType.Space,
        operation: 'job-handler-success',
        source: spaceId,
        environmentId: space.environmentId,
      })
      await api.jobs.execute(successJob.id)

      const { data: failedJob } = await api.jobs.create({
        type: Flatfile.JobType.Space,
        operation: 'job-handler-failure',
        source: spaceId,
        environmentId: space.environmentId,
      })
      await api.jobs.execute(failedJob.id)
    })

    afterAll(async () => {
      await deleteSpace(spaceId)
    })

    test('success', async () => {
      await listener.waitFor('job:ready', 1, { operation: 'job-handler-success' })

      expect(mockFn).toHaveBeenCalled()
    })

    test('failure', async () => {
      await listener.waitFor('job:ready', 1, { operation: 'job-handler-failure' })

      expect(logErrorSpy).toHaveBeenCalledWith(
        '[@flatfile/plugin-job-handler]:[FATAL] trigger job:failed'
      )
      expect(mockErrorFn).toThrow()
    })
  })
})
