import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordReadWriteStream } from './record.hook.stream'
import { Item } from './utils/item'

export interface RecordHookStreamOptions {
  includeMessages?: boolean
  includeMetadata?: boolean
  debug?: boolean
}

export const recordHookStream = (
  sheetSlug: string,
  callback: (items: Item[], event: FlatfileEvent) => Item[] | Promise<Item[]>,
  options: RecordHookStreamOptions = {}
) => {
  return (listener: FlatfileListener) => {
    listener.on('commit:created', { sheetSlug }, (event: FlatfileEvent) =>
      recordReadWriteStream(callback, event, options)
        .then(
          (results: { totalProcessed: number; totalTimeSeconds: string }) => {
            console.log(
              `Processed ${results.totalProcessed} records in ${results.totalTimeSeconds} seconds (r/s: ${Math.ceil(results.totalProcessed / parseFloat(results.totalTimeSeconds))})`
            )
          }
        )
        .catch((error) => {
          console.error('Processing failed:', error)
          throw error
        })
    )
  }
}
