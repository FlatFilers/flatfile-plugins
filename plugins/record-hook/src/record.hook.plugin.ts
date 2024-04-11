import type { FlatfileRecord } from '@flatfile/hooks'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { BulkRecordHookOptions, RecordHookOptions } from './RecordHook'
import { BulkRecordHook, RecordHook } from './RecordHook'

export const recordHookPlugin = (
  sheetSlug: string,
  callback: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: RecordHookOptions = {}
) => {
  return (listener: FlatfileListener) => {
    listener.on('commit:created', { sheetSlug }, (event: FlatfileEvent) =>
      RecordHook(event, callback, options)
    )
  }
}

export const bulkRecordHookPlugin = (
  sheetSlug: string,
  callback: (
    records: FlatfileRecord[],
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: BulkRecordHookOptions = {}
) => {
  return (listener: FlatfileListener) => {
    listener.on('commit:created', { sheetSlug }, (event: FlatfileEvent) =>
      BulkRecordHook(event, callback, options)
    )
  }
}

export {
  bulkRecordHookPlugin as bulkRecordHook,
  recordHookPlugin as recordHook,
}
