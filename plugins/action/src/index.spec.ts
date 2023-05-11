import { action } from '.'
import { Client, FlatfileEvent } from '@flatfile/listener'

describe('action', () => {
  let testFn: jest.Mock

  beforeEach(() => {
    testFn = jest.fn()
  })

  test('it calls the passed function when action is triggered', () => {
    const client = Client.create((c) => {
      c.use(action('originSlug', 'actionName', testFn))
    })
    client.dispatchEvent({
      topic: 'action:triggered',
      context: { actionName: 'originSlug:actionName' },
    })
    expect(testFn).toHaveBeenCalledTimes(1)
  })
})
