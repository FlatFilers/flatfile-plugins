import { FlatfileEvent } from '@flatfile/listener'

export async function asyncBatch<T, R>(
  arr: T[],
  callback: (chunk: T[], event?: FlatfileEvent) => Promise<R>,
  options: { chunkSize?: number; parallel?: number } = {},
  event?: FlatfileEvent
): Promise<R[]> {
  const { chunkSize, parallel } = { chunkSize: 3000, parallel: 1, ...options }
  const results: R[] = []

  // Split the array into chunks
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }

  // Create a helper function to process a chunk
  async function processChunk(chunk: T[]): Promise<void> {
    const result = await callback(chunk, event)
    results.push(result)
  }

  // Execute the chunks in parallel
  const promises: Promise<void>[] = []
  let running = 0
  let currentIndex = 0

  function processNext(): void {
    if (currentIndex >= chunks.length) {
      // All chunks have been processed
      return
    }

    const currentChunk = chunks[currentIndex]
    const promise = processChunk(currentChunk).finally(() => {
      running--
      processNext() // Process next chunk
    })

    promises.push(promise)
    currentIndex++
    running++

    if (running < parallel) {
      processNext() // Process another chunk if available
    }
  }

  // Start processing the chunks
  for (let i = 0; i < parallel && i < chunks.length; i++) {
    processNext()
  }

  // Wait for all promises to resolve
  await Promise.all(promises)

  return results
}
