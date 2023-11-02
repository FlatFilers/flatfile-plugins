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
  const { trackChanges } = event.payload

  const completeCommit = async () => {
    if (trackChanges) {
      try {
        await api.commits.complete(versionId)
      } catch (e) {
        console.log(`Error completing commit: ${e}`)
      }
    }
  }

  const fetchData = async () => {
    try {
      const data = await event.data
      return data.records && data.records.length
        ? prepareXRecords(data.records)
        : undefined
    } catch (e) {
      console.log(`Error fetching records: ${e}`)
    }
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
      await completeCommit()
      return
    }

    await event.cache.init<FlatfileRecords<any>>('originalRecords', fetchData)

    // Execute client-defined data hooks
    await asyncBatch(batch.records, handler, options, event)

    event.afterAll(async () => {
      const batch = event.cache.get<FlatfileRecords<any>>('records')
      const originalRecords =
        event.cache.get<FlatfileRecords<any>>('originalRecords')
      const modifiedRecords = batch.records.filter((record) =>
        hasRecordChanges(record, originalRecords.records)
      )
      if (!modifiedRecords || modifiedRecords.length === 0) {
        if (options.debug) {
          console.log('No records modified')
        }
        await completeCommit()
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

const hasRecordChanges = (
  record: FlatfileRecord,
  originalRecords: FlatfileRecord[]
) => {
  const originalRecord = originalRecords.find(
    (original) => original.rowId === record.rowId
  )
  return !deepEqual(originalRecord, record)
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true

  const keysA = Object.keys(obj1)
  const keysB = Object.keys(obj2)

  if (keysA.length !== keysB.length) return false

  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(obj1[key], obj2[key])) return false
  }

  return true
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
