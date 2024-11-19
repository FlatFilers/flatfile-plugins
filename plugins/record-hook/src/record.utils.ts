import type { Flatfile } from '@flatfile/api'
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'
import type { FlatfileEvent } from '@flatfile/listener'
import { logError, logInfo } from '@flatfile/util-common'
import { RecordTranslator } from './record.translator'

// deepEqual is a generic object comparison function that is ambivalent to the key order
export function deepEqual(obj1, obj2, options?: { removeUnchanged: boolean }) {
  if (obj1 === obj2) {
    return true
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false
  }

  let keysObj1 = Object.keys(obj1)
  let keysObj2 = Object.keys(obj2)

  if (keysObj1.length !== keysObj2.length) {
    return false
  }

  let result = true
  for (let key of keysObj1) {
    if (!keysObj2.includes(key)) {
      return false
    }

    if (key === 'values' && options?.removeUnchanged) {
      // Handle values object specially
      const values1 = obj1[key]
      const values2 = obj2[key]
      const valueKeys = Object.keys(values1)

      // Compare each field value
      for (const fieldKey of valueKeys) {
        const equal = deepEqual(values1[fieldKey], values2[fieldKey], options)
        if (equal) {
          delete values1[fieldKey]
          delete values2[fieldKey]
        }
        if (!equal) result = false
      }

      // Remove values object if empty
      if (Object.keys(values1).length === 0) {
        delete obj1[key]
        delete obj2[key]
      }
    } else {
      if (!deepEqual(obj1[key], obj2[key], options)) {
        result = false
      }
    }
  }

  return result
}

/**
 * This function is used to clean a the original record before it compared to the modified/updated record.
 *
 * @remarks
 * Prior to the recordHook's callback being called, the RecordTranslator's toFlatfileRecords() method is called
 * which converts the records into a FlatfileRecords object. This removes fields that the recordHook's callback is
 * expected to check and re-add (i.e. custom-logic messages) and also removes system fields like 'updatedAt'. After all
 * callbacks have run, the toXRecords() method is called to convert the records back into the original format, adds
 * 'source: custom-logic' to all messages and sets all fields to 'valid: true'.
 *
 * This function is intended to remove fields that will never be set on a modified record, specifically 'valid' at the
 * the root level, updatedAt at all levels, and any message that does not have a source of 'custom-logic'.
 */
export function cleanRecord(record: Flatfile.RecordWithLinks | undefined) {
  if (!record) {
    return
  }
  // Remove 'valid' at the root level of the Record, but not on the Record's fields
  if (Object.keys(record).includes('valid')) {
    delete record.valid
  }
  // Remove 'updatedAt' at all levels of the Record
  deleteKeys(record.values, ['updatedAt'])
}

function deleteKeys(obj, keys) {
  if (typeof obj !== 'object' || obj === null) {
    return
  }

  Object.keys(obj).forEach((key) => {
    if (keys.includes(key)) {
      delete obj[key]
    } else if (key === 'messages') {
      // Filters out messages not from 'custom-logic'
      if (Array.isArray(obj['messages'])) {
        obj['messages'] = obj['messages'].filter(
          (message) => message.source === 'custom-logic'
        )
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Apply cleaning recursively for nested objects
      deleteKeys(obj[key], keys)
    }
  })
}

export async function completeCommit(
  event: FlatfileEvent,
  debug: boolean
): Promise<void> {
  const { commitId } = event.context
  const { trackChanges } = event.payload

  if (trackChanges) {
    try {
      await event.fetch(`v1/commits/${commitId}/complete`, {
        method: 'POST',
      })
      if (debug) {
        logInfo('@flatfile/plugin-record-hook', 'Commit completed successfully')
      }
    } catch (e) {
      logError(
        '@flatfile/plugin-record-hook',
        `Error completing commit ${commitId}`
      )
    }
  }
  return
}

export async function prepareFlatfileRecords(
  records: any
): Promise<Flatfile.RecordsWithLinks> {
  const fromFlatfile = new RecordTranslator<FlatfileRecord<any>>(records)
  return fromFlatfile.toXRecords()
}

export async function prepareXRecords(
  records: any
): Promise<FlatfileRecords<any>> {
  const fromX = new RecordTranslator<Flatfile.RecordWithLinks>(records)
  return fromX.toFlatfileRecords()
}

export function startTimer(label: string, debug: boolean) {
  debug && console.time(`⏱️  ${label}`)
}

export function endTimer(label: string, debug: boolean) {
  debug && console.timeEnd(`⏱️  ${label}`)
}
