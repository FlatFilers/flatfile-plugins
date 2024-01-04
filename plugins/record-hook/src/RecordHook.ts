import { Flatfile } from '@flatfile/api'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import { FlatfileEvent } from '@flatfile/listener'
import { asyncBatch } from '@flatfile/util-common'
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
  const { commitId } = event.context
  const { trackChanges } = event.payload

  const completeCommit = async () => {
    if (trackChanges) {
      try {
        await event.fetch(`v1/commits/${commitId}/complete`, {
          method: 'POST',
        })
        if (options.debug) {
          console.log('Commit completed successfully')
        }
      } catch (e) {
        console.log(`Error completing commit: ${e}`)
      }
    }
  }

  const fetchData = async () => {
    try {
      const data = await event.data
      return data.records && data.records.length ? data.records : undefined
    } catch (e) {
      console.log(`Error fetching records: ${e}`)
    }
  }

  try {
    const originalRecords = await event.cache.init<Flatfile.Record_[]>(
      'originalRecords',
      fetchData
    )

    if (!originalRecords || originalRecords.length === 0) {
      if (options.debug) {
        console.log('No records to process')
      }
      await completeCommit()
      return
    }

    const batch = await event.cache.init<FlatfileRecords<any>>(
      'records',
      async () => await prepareXRecords(originalRecords)
    )

    // Execute client-defined data hooks
    await asyncBatch(batch.records, handler, options, event)

    event.afterAll(async () => {
      const { records } = event.cache.get<FlatfileRecords<any>>('records')
      const batch = new RecordTranslator<FlatfileRecord>(records).toXRecords()
      const originalRecords =
        event.cache.get<Flatfile.Record_[]>('originalRecords')
      const modifiedRecords = batch.filter((record) =>
        hasRecordChanges(record, originalRecords)
      )
      if (!modifiedRecords || modifiedRecords.length === 0) {
        if (options.debug) {
          console.log('No records modified')
        }
        await completeCommit()
        return
      }

      try {
        return await event.update(modifiedRecords)
      } catch (e) {
        console.log(`Error updating records: ${e}`)
      }
    })
  } catch (e) {
    console.error(`An error occurred while running the handler: ${e.message}`)
  }

  return handler
}

const hasRecordChanges = (record, originalRecords) => {
  const originalRecord = originalRecords.find(
    (original) => original.rowId === record.rowId
  )
  return JSON.stringify(record) !== JSON.stringify(originalRecord)
}

const prepareXRecords = async (records: any): Promise<FlatfileRecords<any>> => {
  const fromX = new RecordTranslator<Flatfile.Record_>(records)
  return fromX.toFlatFileRecords()
}
