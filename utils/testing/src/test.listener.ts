import type { Flatfile } from '@flatfile/api'

import {
  EventFilter,
  FlatfileEvent,
  FlatfileListener,
} from '@flatfile/listener'

type invocationWatcher = {
  filter: EventFilter | undefined
  executedCount: number
  neededCount: number
  resolver: (result: number | PromiseLike<number>) => void
}

/**
 * TestListener class extending from FlatfileListener.
 * Includes utilities designed for waiting for events and maintaining event invocation counts.
 */
export class TestListener extends FlatfileListener {
  // Mapping of event names to their invocation counts
  public invocations: Map<string, FlatfileEvent[]> = new Map()

  // List of watchers for event invocations
  public invocationWatchers: invocationWatcher[] = []

  /**
   * Overridden method from FlatfileListener to handle event dispatch.
   *
   * @param event The event being dispatched
   */
  async dispatchEvent(event: any): Promise<void> {
    await super.dispatchEvent(event)

    if (this.invocations.has(event.topic)) {
      this.invocations.get(event.topic).push(event)
    } else {
      this.invocations.set(event.topic, [event])
    }

    for (const watcher of this.invocationWatchers) {
      if (this.matchEvent(event, watcher.filter)) {
        watcher.executedCount++

        if (watcher.executedCount >= watcher.neededCount) {
          watcher.resolver(watcher.executedCount)
        }
      }
    }
  }

  /**
   * Wait for a certain count of a specific event.
   *
   * @param topic The event to wait for
   * @param neededCount The count of the event
   * @param filter The filter object to match. Supports passing a string for job name
   * @returns A promise that resolves when the count of the event has been reached
   */
  waitFor(
    topic: string,
    neededCount: number = 1,
    filter?: EventFilter | string
  ): Promise<number> {
    if (typeof filter === 'string') {
      filter = { topic, job: filter }
    } else {
      filter = { topic, ...filter }
    }

    return new Promise((resolver) => {
      this.invocationWatchers.push({
        filter,
        neededCount,
        executedCount: 0,
        resolver,
      })

      const pastInvocations = this.invocations.get(topic) || []

      for (const event of pastInvocations) {
        for (const watcher of this.invocationWatchers) {
          if (
            this.matchEvent(event, watcher.filter) &&
            watcher.executedCount >= watcher.neededCount
          ) {
            watcher.resolver(watcher.executedCount)
          }
        }
      }
    })
  }

  /**
   * Reset the count of invocations for all events.
   */
  resetCount(): void {
    this.invocations = new Map()
  }

  /**
   * Reset the state of the listener, clearing all event listeners and counts, and resetting all nodes.
   */
  reset(): void {
    this.listeners = []
    this.invocations = new Map()
    this.invocationWatchers = []
    this.nodes = []
  }
}
