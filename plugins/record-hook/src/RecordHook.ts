import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { Record_, Records } from '@flatfile/api/api'
import { RecordTranslater } from './record.translater'
import { asyncBatch } from '@flatfile/util-common'
import { Effect, Duration } from 'effect'

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { concurrency?: number } = {}
) => {
  await BulkRecordHook(event, async (records, event) => {
    const { concurrency } = { concurrency: 10, ...options }
    const handlers = records.map((record: FlatfileRecord) =>
      Effect.promise(async () => {
        await handler(record, event)
      })
    )
    Effect.runPromise(
      Effect.all(handlers, {
        concurrency,
      })
    )
  })
}

export const BulkRecordHook = async (
  event: FlatfileEvent,
  handler: (
    records: FlatfileRecord[],
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { chunkSize?: number; parallel?: number } = {}
) => {
  try {
    const records = await event.cache.init<Records>(
      'records',
      async () => (await event.data).records
    )
    if (!records) return

    const batch = await prepareXRecords(records)

    // run client defined data hooks
    await asyncBatch(batch.records, handler, options)

    const recordsUpdates = new RecordTranslater<FlatfileRecord>(
      batch.records
    ).toXRecords()

    await event.cache.set('records', async () => recordsUpdates)

    event.afterAll(async () => {
      try {
        const records = event.cache.get<Records>('records')
        await event.update(records)
      } catch (e) {
        console.log(`Error updating records: ${e}`)
      }
    })
  } catch (e) {
    console.log(`Error getting records: ${e}`)
  }
}

const prepareXRecords = async (records: any): Promise<FlatfileRecords<any>> => {
  const clearedMessages: Record_[] = records.map(
    (record: { values: { [x: string]: { messages: never[] } } }) => {
      // clear existing cell validation messages
      Object.keys(record.values).forEach((k) => {
        record.values[k].messages = []
      })
      return record
    }
  )
  const fromX = new RecordTranslater<Record_>(clearedMessages)
  return fromX.toFlatFileRecords()
}
