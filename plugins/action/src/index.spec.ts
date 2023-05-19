import { action } from '.'
import { Client, FlatfileVirtualMachine } from '@flatfile/listener'

const updateJobsFn = jest.fn()
const testFn = jest.fn()

jest.mock('@flatfile/api', () => ({
  FlatfileClient: jest.fn().mockImplementation(() => {
    return {
      jobs: {
        update: (jobId: string, payload: any) => updateJobsFn(jobId, payload),
      },
    }
  }),
}))

describe('action', () => {
  test('it calls the passed function and the jobs api when action is triggered', async () => {
    const client = await Client.create((c) => {
      c.use(action('duplicateOperation', testFn))
    })
    const FlatfileVM = await new FlatfileVirtualMachine()
    await client.mount(FlatfileVM)
    await client.dispatchEvent({
      topic: 'job:created',
      context: {
        jobId: 'us_jb_nkP9PubO',
      },
      payload: {
        operation: 'duplicateOperation',
      },
    })
    expect(testFn).toHaveBeenCalledTimes(1)
    expect(updateJobsFn).toHaveBeenCalledTimes(2)
    expect(updateJobsFn.mock.calls).toEqual([
      [
        'us_jb_nkP9PubO',
        {
          status: 'executing',
        },
      ],
      [
        'us_jb_nkP9PubO',
        {
          status: 'complete',
        },
      ],
    ])
  })
})
