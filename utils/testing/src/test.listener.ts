import { FlatfileListener } from '@flatfile/listener'

/**
 * TestListener class extending from FlatfileListener.
 * Includes utilities designed for waiting for events and maintaining event invocation counts.
 */
export class TestListener extends FlatfileListener {
  // Mapping of event names to their invocation counts
  public invocations: Map<string, number> = new Map()

  // List of watchers for event invocations
  private invocationWatchers: [
    number,
    (num: number) => void,
    string,
    string
  ][] = []

  /**
   * Overridden method from FlatfileListener to handle event dispatch.
   *
   * @param event The event being dispatched
   */
  async dispatchEvent(event: any): Promise<void> {
    const currentCount = this.invocations.get(event.topic) || 0
    this.invocations.set(event.topic, currentCount + 1)

    await super.dispatchEvent(event)

    for (let [count, resolver, eventName, job] of this.invocationWatchers) {
      const eventCount = this.invocations.get(eventName)

      if (event.topic === eventName && eventCount && eventCount >= count) {
        if (!job || event.payload.job === job) {
          resolver(eventCount)
        }
      }
    }
  }

  /**
   * Wait for a certain count of a specific event.
   *
   * @param event The event to wait for
   * @param count The count of the event
   * @returns A promise that resolves when the count of the event has been reached
   */
  waitFor(event: string, count: number = 1, job?: string): Promise<number> {
    return new Promise((resolve) => {
      this.invocationWatchers.push([count, resolve, event, job])

      if (this.invocations.get(event) >= count) {
        resolve(this.invocations.get(event))
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
    // @ts-ignore
    this.listeners = []
    this.invocations = new Map()
    // @ts-ignore
    this.nodes.forEach((n) => n.reset())
  }
}
