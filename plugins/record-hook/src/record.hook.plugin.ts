import type { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { BulkRecordHook, RecordHook } from './RecordHook'

export const recordHookPlugin = (
  sheetSlug: string,
  callback: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { debug?: boolean } = {}
) => {
  return (client: FlatfileListener) => {
    client.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
      return RecordHook(event, callback, options)
    })
  }
}

export const bulkRecordHookPlugin = (
  sheetSlug: string,
  callback: (
    records: FlatfileRecord[],
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { chunkSize?: number; parallel?: number; debug?: boolean } = {}
) => {
  return (client: FlatfileListener) => {
    client.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
      return BulkRecordHook(event, callback, options)
    })
  }
}

export {
  bulkRecordHookPlugin as bulkRecordHook,
  recordHookPlugin as recordHook,
}
