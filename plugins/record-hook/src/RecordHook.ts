import type { Flatfile } from '@flatfile/api'
import type { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import type { FlatfileEvent } from '@flatfile/listener'
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

  const fetchData = async (): Promise<
    Flatfile.RecordsWithLinks | undefined
  > => {
    try {
      const data = await event.data
      return data.records && data.records.length ? data.records : undefined
    } catch (e) {
      console.log(`Error fetching records: ${e}`)
    }
    return undefined
  }

  try {
    const data = await event.cache.init<Flatfile.RecordsWithLinks>(
      'data',
      async () => await fetchData()
    )

    if (!data || data.length === 0) {
      if (options.debug) {
        console.log('No records to process')
      }
      await completeCommit()
      return
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
          const originalRecord: Flatfile.RecordWithLinks = data.find(
            (original: Flatfile.RecordWithLinks) => original.id === record.id
          )!
          return hasChange(record, originalRecord)
        }
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
}

function hasChange(
  originalRecord: Flatfile.RecordWithLinks,
  modifiedRecord: Flatfile.RecordWithLinks
): boolean {
  const ignoredRecordKeys = ['valid', 'updatedAt']

  // Check if objects are identical or both null
  if (originalRecord === modifiedRecord) {
    return false
  }

  // Check if one of them is null or not an object
  if (
    typeof originalRecord !== 'object' ||
    typeof modifiedRecord !== 'object' ||
    originalRecord == null ||
    modifiedRecord == null
  ) {
    return true
  }

  // Get keys excluding ignored keys at the current level
  const keysOriginal = Object.keys(originalRecord).filter(
    (key) => !ignoredRecordKeys.includes(key)
  )
  const keysModified = Object.keys(modifiedRecord).filter(
    (key) => !ignoredRecordKeys.includes(key)
  )

  // Check if number of properties is different
  if (keysOriginal.length !== keysModified.length) {
    return true
  }

  // Iterate over keys and check for changes, including nested objects
  for (const key of keysOriginal) {
    if (!keysModified.includes(key)) {
      return true
    }

    // Check if the current property is an object and needs recursive comparison
    if (
      typeof originalRecord[key] === 'object' &&
      typeof modifiedRecord[key] === 'object' &&
      originalRecord[key] !== null &&
      modifiedRecord[key] !== null
    ) {
      if (hasChange(originalRecord[key], modifiedRecord[key])) {
        return true
      }
    } else if (originalRecord[key] !== modifiedRecord[key]) {
      // Direct comparison for non-object or primitive types
      return true
    }
  }

  return false
}

const prepareFlatfileRecords = async (
  records: any
): Promise<Flatfile.RecordsWithLinks> => {
  const fromFlatfile = new RecordTranslator<FlatfileRecord<any>>(records)
  return fromFlatfile.toXRecords()
}

const prepareXRecords = async (records: any): Promise<FlatfileRecords<any>> => {
  const fromX = new RecordTranslator<Flatfile.RecordWithLinks>(records)
  return fromX.toFlatfileRecords()
}
