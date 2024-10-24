import { TestListener } from './index'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import '../../../test/toBePendingMatcher'

const currentEventLoopEnd = () =>
  new Promise((resolve) => setImmediate(resolve))

describe('TestListener', () => {
  let listener: TestListener

  beforeEach(() => {
    listener = new TestListener()
  })

  describe('#dispatchEvent', () => {
    it('appends the event to the invocations map', async () => {
      const events = [
        { topic: 'first' },
        { topic: 'second' },
        { topic: 'second', payload: { job: 'somethingSpecific' } },
      ]

      await Promise.all(events.map((event) => listener.dispatchEvent(event)))

      expect(listener.invocations.get('first')).toEqual([events[0]])
      expect(listener.invocations.get('second')).toEqual([events[1], events[2]])
      expect(listener.invocations.get('third')).toBe(undefined)
    })

    it('increments the `executedCount` on any matching watchers', async () => {
      listener.waitFor('example:ready')
      listener.waitFor('example:completed')

      listener.dispatchEvent({ topic: 'example:ready' })
      listener.dispatchEvent({ topic: 'example:ready' })
      await currentEventLoopEnd()

      expect(listener.invocationWatchers[0].executedCount).toBe(2)
      expect(listener.invocationWatchers[1].executedCount).toBe(0)
    })

    it('fulfills pending promises that match the event', async () => {
      const exampleReady = vi.fn()
      const exampleCompleted = vi.fn()

      listener.waitFor('example:ready').then(exampleReady)
      listener
        .waitFor('example:ready', 1, { sheet: 'specificSheet' })
        .then(exampleReady)
      listener.waitFor('example:completed').then(exampleCompleted)

      await listener.dispatchEvent({ topic: 'example:ready' })

      expect(exampleReady).toHaveBeenCalledTimes(1)
      expect(exampleCompleted).toHaveBeenCalledTimes(0)
    })
  })

  describe('#waitFor', () => {
    it('adds a new watcher to the invocationWatchers list', async () => {
      listener.waitFor('example:ready')
      await currentEventLoopEnd()

      expect(listener.invocationWatchers).toHaveLength(1)
      expect(listener.invocationWatchers[0]).toMatchObject({
        filter: { topic: 'example:ready' },
        neededCount: 1,
        executedCount: 0,
        resolver: expect.any(Function),
      })
    })

    it('resolves when the event is dispatched', async () => {
      const promisedEvent = listener.waitFor('example:ready')

      listener.dispatchEvent({ topic: 'example:ready' })
      await currentEventLoopEnd()

      expect(promisedEvent).not.toBePending()
      expect(promisedEvent).resolves.not.toThrow()
    })

    it('does not resolve before the specified number of dispatches is met', async () => {
      const promisedEvent = listener.waitFor('example:ready', 2)

      listener.dispatchEvent({ topic: 'example:ready' })
      await currentEventLoopEnd()

      expect(promisedEvent).toBePending()
    })

    it('resolves when the specified number of dispatches is met', async () => {
      const promisedEvent = listener.waitFor('example:ready', 2)

      listener.dispatchEvent({ topic: 'example:ready' })
      listener.dispatchEvent({ topic: 'example:ready' })
      await currentEventLoopEnd()

      expect(promisedEvent).not.toBePending()
      expect(promisedEvent).resolves.not.toThrow()
    })

    it('accounts for past invocations matching the provided filters', async () => {
      const initialPromise = listener.waitFor('example:ready', 1)
      listener.dispatchEvent({ topic: 'example:ready' })
      await currentEventLoopEnd()

      const secondPromise = listener.waitFor('example:ready', 2)
      listener.dispatchEvent({ topic: 'example:ready' })
      await currentEventLoopEnd()

      expect(initialPromise).not.toBePending()
      expect(initialPromise).resolves.not.toThrow()
      expect(secondPromise).not.toBePending()
      expect(secondPromise).resolves.not.toThrow()
    })

    it('does not resolve before an event matching the filter is dispatched', async () => {
      const promisedEvent = listener.waitFor('example:ready', 1, {
        sheet: 'someSpecificSheet',
      })

      listener.dispatchEvent({ topic: 'example:ready' })
      await currentEventLoopEnd()

      expect(promisedEvent).toBePending()
    })

    it('resolves when an event matching the filter is dispatched', async () => {
      const promisedEvent = listener.waitFor('example:ready', 1, {
        sheet: 'someSpecificSheet',
      })

      listener.dispatchEvent({
        topic: 'example:ready',
        payload: { sheet: 'someSpecificSheet' },
      })
      await currentEventLoopEnd()

      expect(promisedEvent).not.toBePending()
      expect(promisedEvent).resolves.not.toThrow()
    })

    it('supports passing a string for the job filter', async () => {
      listener.waitFor('example:ready', 1, 'specificJob')

      expect(listener.invocationWatchers[0].filter).toMatchObject({
        job: 'specificJob',
      })
    })
  })
})
