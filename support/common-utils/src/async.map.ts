/**
 * Configuration for asyncMap function
 *
 * @property {boolean} parallel - Flag to control parallel or sequential (default) execution.
 * @property {number} timeout - Timeout duration (in milliseconds) for each callback.
 */
interface AsyncMapConfig {
  readonly parallel?: boolean
  readonly timeout?: number
}

/**
 * A utility function to map over an array and perform asynchronous callbacks in series or parallel.
 *
 * @param items - The array of items to be processed.
 * @param callback - The asynchronous callback function to be applied on each item.
 * @param config - Configuration for controlling parallel execution and timeout.
 * @returns A promise that resolves to an array of results of each callback.
 */
export async function asyncMap<T, U>(
  items: ReadonlyArray<T>,
  callback: (item: T) => Promise<U>,
  config: AsyncMapConfig = { parallel: false, timeout: 30_000 }
): Promise<ReadonlyArray<U>> {
  const { parallel, timeout } = config

  const wrapper = (item: T): Promise<U> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Operation timed out.')),
        timeout
      )

      callback(item)
        .then((res) => {
          clearTimeout(timer)
          resolve(res)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })

  if (parallel) {
    return Promise.all(items.map(wrapper))
  }

  const results: U[] = []
  for (const item of items) {
    try {
      const result = await wrapper(item)
      results.push(result)
    } catch (error) {
      throw new Error(`Error processing item. ${error}`)
    }
  }

  return results
}
