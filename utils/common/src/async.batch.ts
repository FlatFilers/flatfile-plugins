import { FlatfileEvent } from '@flatfile/listener'

export async function asyncBatch<T, R>(
  arr: T[],
  callback: (chunk: T[], event?: FlatfileEvent) => Promise<R>,
  options: { chunkSize?: number; parallel?: number; debug?: boolean } = {},
  event?: FlatfileEvent
): Promise<R[]> {
  const { chunkSize = 10_000, parallel = 1, debug = false } = options
  const chunks = chunkify<T>(arr, chunkSize)

  if (debug) {
    console.log(`${chunks.length} chunks to be processed`)
  }

  const results: Map<number, R> = new Map()

  async function processChunk(
    chunkIndex: number,
    threadId: number
  ): Promise<void> {
    if (debug) {
      console.log(`Thread ${threadId} processing chunk ${chunkIndex}`)
    }

    const result = await callback(chunks[chunkIndex], event)
    results.set(chunkIndex, result)
  }

  let currentIndex = 0
  async function processChunks(threadId: number): Promise<void> {
    while (currentIndex < chunks.length) {
      const chunkIndex = currentIndex++
      await processChunk(chunkIndex, threadId)
    }
  }

  const promises: Promise<void>[] = Array.from({ length: parallel }, (_, i) =>
    processChunks(i)
  )

  await Promise.all(promises)

  if (debug) {
    console.log('All chunks processed')
  }

  return Array.from(results.values())
}

export function chunkify<T>(arr: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    return []
  }

  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, i * chunkSize + chunkSize)
  )
}
