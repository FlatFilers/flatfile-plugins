import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { BulkRecordHook, RecordHook } from './RecordHook'
import type { FlatfileRecord } from '@flatfile/hooks'

export const recordHookPlugin = (
  sheetSlug: string,
  callback: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { concurrency?: number } = {}
) => {
  return (listener: FlatfileListener) => {
    listener.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
      RecordHook(event, callback, options)
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
  return (listener: FlatfileListener) => {
    listener.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
      BulkRecordHook(event, callback, options)
    })
  }
}

export {
  recordHookPlugin as recordHook,
  bulkRecordHookPlugin as bulkRecordHook,
}
