import type { Flatfile } from '@flatfile/api'
import type { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import type { FlatfileEvent } from '@flatfile/listener'
import { asyncBatch, logError, logInfo } from '@flatfile/util-common'
import {
  cleanRecord,
  completeCommit,
  deepEqual,
  prepareFlatfileRecords,
  prepareXRecords,
} from './record.utils'

export interface RecordHookOptions {
  concurrency?: number
  debug?: boolean
}

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: RecordHookOptions = {}
) => {
  const { concurrency = 10 } = options
  return BulkRecordHook(
    event,
    async (records, event) => {
      const promises = new Set<Promise<any>>()

      for (const record of records) {
        const promise = Promise.resolve(handler(record, event)).finally(() =>
          promises.delete(promise)
        )
        promises.add(promise)

        if (promises.size >= concurrency) {
          await Promise.race(promises)
        }
      }

      return await Promise.all(promises)
    },
    options
  )
}

export interface BulkRecordHookOptions {
  chunkSize?: number
  parallel?: number
  debug?: boolean
}

export const BulkRecordHook = async (
  event: FlatfileEvent,
  handler: (
    records: FlatfileRecord[],
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: BulkRecordHookOptions = {}
) => {
  const { debug = false } = options

  try {
    const data = await event.cache.init<Flatfile.RecordsWithLinks>(
      'data',
      async (): Promise<Flatfile.RecordsWithLinks> => {
        try {
          const data = await event.data
          return data.records && data.records.length ? data.records : undefined
        } catch (e) {
          throw new Error('Error fetching records')
        }
      }
    )

    if (!data || data.length === 0) {
      logInfo('@flatfile/plugin-record-hook', 'No records to process')
      await completeCommit(event, debug)
    }

    const batch = await event.cache.init<FlatfileRecords<any>>(
      'records',
      async () => await prepareXRecords(data)
    )

    // Execute client-defined data hooks
    await asyncBatch(batch.records, handler, options, event)

    event.afterAll(async () => {
      const { records: batch } =
        event.cache.get<FlatfileRecords<any>>('records')
      const records: Flatfile.RecordsWithLinks = await prepareFlatfileRecords(
        batch
      )

      const data = await event.cache.get<Flatfile.RecordsWithLinks>('data')
      const modifiedRecords: Flatfile.RecordsWithLinks = records.filter(
        (record: Flatfile.RecordWithLinks) => {
          const originalRecord: Flatfile.RecordWithLinks | undefined =
            data.find(
              (original: Flatfile.RecordWithLinks) => original.id === record.id
            )
          cleanRecord(originalRecord) // Remove fields that should not be compared
          const hasChanges = !deepEqual(record, originalRecord)
          if (debug) {
            logInfo(
              '@flatfile/plugin-record-hook',
              `Record ${record.id} ${
                hasChanges ? 'has' : 'does not have'
              } changes`
            )
          }
          return hasChanges
        }
      )

      if (!modifiedRecords || modifiedRecords.length === 0) {
        logInfo('@flatfile/plugin-record-hook', 'No records modified')
        return await completeCommit(event, debug)
      }

      try {
        return await event.update(modifiedRecords)
      } catch (e) {
        throw new Error('Error updating records')
      }
    })
  } catch (e) {
    logError('@flatfile/plugin-record-hook', (e as Error).message)
    await completeCommit(event, debug)
  }
}
