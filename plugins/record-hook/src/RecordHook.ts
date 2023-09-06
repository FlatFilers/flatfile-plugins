import { Record_, Records } from '@flatfile/api/api'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { FlatfileEvent } from '@flatfile/listener'
import { asyncBatch } from '@flatfile/util-common'
import PQueue from 'p-queue'
import { RecordTranslater } from './record.translater'

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { concurrency?: number } = {}
) => {
  return BulkRecordHook(event, async (records, bulkEvent) => {
    const { concurrency } = { concurrency: 10, ...options }
    const queue = new PQueue({ concurrency })

    // Add tasks to the queue and wait for them to finish
    const tasks = records.map((record) =>
      queue.add(() => handler(record, bulkEvent))
    )
    return await Promise.all(tasks)
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
    await asyncBatch(batch.records, handler, options, event)

    const recordsUpdates = new RecordTranslater<FlatfileRecord>(
      batch.records
    ).toXRecords()

    await event.cache.set('records', async () => recordsUpdates)

    event.afterAll(async () => {
      const updatedRecords = event.cache.get<Records>('records')
      try {
        return await event.update(updatedRecords)
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
