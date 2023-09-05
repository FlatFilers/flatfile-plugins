import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { Record_, Records } from '@flatfile/api/api'
import { RecordTranslater } from './record.translater'
import { asyncBatch } from '@flatfile/util-common'
import PQueue from 'p-queue'

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (
    record: FlatfileRecord,
    event?: FlatfileEvent
  ) => any | Promise<any>,
  options: { concurrency?: number } = {}
) => {
  await BulkRecordHook(event, async (records, bulkEvent) => {
    const { concurrency } = { concurrency: 10, ...options }
    const queue = new PQueue({ concurrency })
    await Promise.all(
      records.map(async (record) => {
        queue.add(() => handler(record, bulkEvent))
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
    await asyncBatch(batch.records, handler, options, event)

    const recordsUpdates = new RecordTranslater<FlatfileRecord>(
      batch.records
    ).toXRecords()

    await event.cache.set('records', async () => recordsUpdates)

    // event.afterAll(async () => {
    try {
      const records = event.cache.get<Records>('records')
      await event.update(records)
    } catch (e) {
      console.log(`Error updating records: ${e}`)
    }
    // })
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
