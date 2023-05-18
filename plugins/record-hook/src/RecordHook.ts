import { FlatfileEvent } from '@flatfile/listener'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { RecordWithLinks } from '@flatfile/api/api'
import { RecordTranslater } from './record.translater'

export const RecordHook = async (
  event: FlatfileEvent,
  handler: (record: FlatfileRecord) => any | Promise<any>
) => {
  const { sheetId } = event.context
  try {
    const { records } = await event.data
    if (!records) return

    const batch = await prepareXRecords(records)

    // run client defined data hooks
    for (const x of batch.records) {
      await handler(x)
    }

    const recordsUpdates = new RecordTranslater<FlatfileRecord>(
      batch.records
    ).toXRecords()

    await event.api.updateRecords({
      sheetId,
      recordsUpdates,
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
