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
        .then((results) => {
          const typedResults = results as {
            totalProcessed: number
            totalTimeSeconds: string
          }
          console.log(
            `[${event.src.id}] Processed ${typedResults.totalProcessed} records in ${typedResults.totalTimeSeconds} seconds (r/s: ${Math.ceil(typedResults.totalProcessed / parseFloat(typedResults.totalTimeSeconds))})`
          )
        })
        .catch((error) => {
          console.error('Processing failed:', error)
          throw error
        })
    )
  }
}
