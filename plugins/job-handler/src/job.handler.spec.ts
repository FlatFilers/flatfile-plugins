import { deleteSpace, setupListener, setupSpace } from '@flatfile/utils-testing'
import { jobHandler } from '.'

describe('JobHandler plugin e2e tests', () => {
  const listener = setupListener()
  const mockFn = jest.fn()
  let spaceId: string

  beforeAll(async () => {
    listener.on('**', (event) => {
      console.log(event.topic, event.payload.job)
    })
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
