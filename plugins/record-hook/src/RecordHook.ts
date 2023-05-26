import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { RecordWithLinks, Record_, RecordsWithLinks } from '@flatfile/api/api'
import { RecordTranslater } from './record.translater'
import api from '@flatfile/api'

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (record: FlatfileRecord) => any | Promise<any>
) => {
  const { sheetId } = event.context
  try {
    const records = await event.cache.init<RecordsWithLinks>(
      'records',
      async () => (await event.data).records
    )
    if (!records) return

    const batch = await prepareXRecords(records)

    // run client defined data hooks
    for (const x of batch.records) {
      await handler(x)
    }

    const recordsUpdates = new RecordTranslater<FlatfileRecord>(
      batch.records
    ).toXRecords()

    // TODO: likely swap this for event.update()
    await event.cache.set('records', async () => recordsUpdates)

    event.afterAll(async () => {
      const records = event.cache.get('records')
      try {
        return await api.records.update(sheetId, records as Record_[])
      } catch (e) {
        console.log(`Error putting records: ${e}`)
      }
    })
  } catch (e) {
    console.log(`Error getting records: ${e}`)
  }

  return handler
}

const prepareXRecords = async (records: any): Promise<FlatfileRecords<any>> => {
  const clearedMessages: RecordWithLinks[] = records.map(
    (record: { values: { [x: string]: { messages: never[] } } }) => {
      // clear existing cell validation messages
      Object.keys(record.values).forEach((k) => {
        record.values[k].messages = []
      })
      return record
    }
  )
  const fromX = new RecordTranslater<RecordWithLinks>(clearedMessages)
  return fromX.toFlatFileRecords()
}
