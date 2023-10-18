import api, { Flatfile } from '@flatfile/api'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { FlatfileEvent } from '@flatfile/listener'
import { asyncBatch } from '@flatfile/util-common'
import { Effect } from 'effect'
import { RecordTranslator } from './record.translator'

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
  const { concurrency } = { concurrency: 10, ...options }
  return BulkRecordHook(
    event,
    async (records, event) => {
      const handlers = await records.map((record: FlatfileRecord) =>
        Effect.promise(async () => {
          await handler(record, event)
        })
      )
      return Effect.runPromise(
        Effect.all(handlers, {
          concurrency,
        })
      )
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
  const { versionId } = event.context

  const fetchData = async () => {
    const data = await event.data
    return data.records && data.records.length
      ? prepareXRecords(data.records)
      : undefined
  }

  try {
    const batch = await event.cache.init<FlatfileRecords<any>>(
      'records',
      fetchData
    )

    if (!batch || batch.records.length === 0) {
      if (options.debug) {
        console.log('No records to process')
      }
      await api.commits.complete(versionId)
      return
    }

    // Execute client-defined data hooks
    await asyncBatch(batch.records, handler, options, event)

    event.afterAll(async () => {
      const batch = event.cache.get<FlatfileRecords<any>>('records')
      const modifiedRecords = batch.records.filter(hasRecordChanges)
      if (!modifiedRecords || modifiedRecords.length === 0) {
        if (options.debug) {
          console.log('No records modified')
        }
        await api.commits.complete(versionId)
        return
      }

      const recordsUpdates = new RecordTranslator<FlatfileRecord>(
        modifiedRecords
      ).toXRecords()

      try {
        return await event.update(recordsUpdates)
      } catch (e) {
        console.log(`Error updating records: ${e}`)
      }
    })
  } catch (e) {
    console.log(`Error getting records: ${e}`)
  }

  return handler
}

const hasRecordChanges = (record: FlatfileRecord) => {
  const messageCount = record.toJSON().info.length
  return (
    JSON.stringify(record.originalValue) !== JSON.stringify(record.value) ||
    messageCount > 0
  )
}

const prepareXRecords = async (records: any): Promise<FlatfileRecords<any>> => {
  const clearedMessages: Flatfile.Record_[] = records.map(
    (record: { values: { [x: string]: { messages: never[] } } }) => {
      // clear existing cell validation messages
      Object.keys(record.values).forEach((k) => {
        record.values[k].messages = []
      })
      return record
    }
  )
  const fromX = new RecordTranslator<Flatfile.Record_>(clearedMessages)
  return fromX.toFlatFileRecords()
}
