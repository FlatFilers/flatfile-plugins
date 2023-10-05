import { Flatfile } from '@flatfile/api'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { FlatfileEvent } from '@flatfile/listener'
import { asyncBatch } from '@flatfile/util-common'
import { Effect } from 'effect'
import { RecordTranslater } from './record.translater'

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { concurrency?: number; debug?: boolean } = {}
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

export const BulkRecordHook = async (
  event: FlatfileEvent,
  handler: (
    records: FlatfileRecord[],
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { chunkSize?: number; parallel?: number; debug?: boolean } = {}
) => {
  try {
    const batch = await event.cache.init<FlatfileRecords<any>>(
      'records',
      async () => {
        const data = await event.data
        return prepareXRecords(data.records)
      }
    )

    if (!batch || batch.records.length === 0) return

    // run client defined data hooks
    await asyncBatch(batch.records, handler, options, event)

    event.afterAll(async () => {
      const batch = event.cache.get<FlatfileRecords<any>>('records')

      const recordsUpdates = new RecordTranslater<FlatfileRecord>(
        batch.records
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
  const fromX = new RecordTranslater<Flatfile.Record_>(clearedMessages)
  return fromX.toFlatFileRecords()
}
