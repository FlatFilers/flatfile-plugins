import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { BulkRecordHook, RecordHook } from './RecordHook'
import type { FlatfileRecord } from '@flatfile/hooks'

export const recordHookPlugin = (
  sheetSlug: string,
  callback: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>
) => {
  return (client: FlatfileListener) => {
    client.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
      return RecordHook(event, callback)
    })
  }
}

export const bulkRecordHookPlugin = (
  sheetSlug: string,
  callback: (
    records: FlatfileRecord[],
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { chunkSize?: number; parallel?: number } = {}
) => {
  return (client: FlatfileListener) => {
    client.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
      return BulkRecordHook(event, callback, options)
    })
  }
}

export {
  recordHookPlugin as recordHook,
  bulkRecordHookPlugin as bulkRecordHook,
}
