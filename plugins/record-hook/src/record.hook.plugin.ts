import type { FlatfileRecord } from '@flatfile/hooks'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import {
  BulkRecordHook,
  BulkRecordHookOptions,
  RecordHook,
  RecordHookOptions,
} from './RecordHook'

export const recordHookPlugin = (
  sheetSlug: string,
  callback: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: RecordHookOptions = {}
) => {
  return (listener: FlatfileListener) => {
    listener.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
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
  options: BulkRecordHookOptions = {}
) => {
  return (listener: FlatfileListener) => {
    listener.on('commit:created', { sheetSlug }, (event: FlatfileEvent) => {
      return BulkRecordHook(event, callback, options)
    })
  }
}

export {
  bulkRecordHookPlugin as bulkRecordHook,
  recordHookPlugin as recordHook,
}
