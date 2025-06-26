import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import { processRecords, updateAllRecords } from '@flatfile/util-common'

const api = new FlatfileClient()

export interface PluginOptions {
  readonly keys?: string[]
  readonly treatments?: Record<string, FieldTreatment>
  readonly defaultTreatment?: 'overwrite' | 'list'
  readonly overwriteHeuristic?: 'first' | 'last' | 'custom'
  readonly custom?: (
    records: Flatfile.RecordsWithLinks,
    key: string,
    fieldKey: string
  ) => any
  readonly debug?: boolean
}

export interface FieldTreatment {
  type: 'overwrite' | 'list'
  heuristic?: 'first' | 'last' | 'custom'
}

export const merge = async (
  event: FlatfileEvent,
  tick: TickFunction,
  opts: PluginOptions
): Promise<void | Flatfile.JobCompleteDetails> => {
  const { sheetId, workbookId } = event.context

  if (!sheetId) {
    throw new Error('Merge must be called from a sheet-level action')
  }

  await tick(0, 'Merge started')

  const {
    data: {
      config: { fields },
    },
  } = await api.sheets.get(sheetId)

  const mergeKeys = opts.keys?.length ? opts.keys : fields.map((f) => f.key)

  for (const key of mergeKeys) {
    const field = fields.find((f) => f.key === key)
    if (!field) {
      throw new Error(`Field "${key}" not found`)
    }
  }

  const nonKeyFields = fields.filter((f) => !mergeKeys.includes(f.key))
  for (const field of nonKeyFields) {
    const treatment = opts.treatments?.[field.key] || {
      type: opts.defaultTreatment || 'overwrite',
    }
    if (treatment.type === 'list') {
      const validListTypes = ['string-list', 'enum-list', 'reference-list']
      if (!validListTypes.includes(field.type)) {
        return {
          info: `Cannot use list treatment for field "${field.key}" of type "${field.type}". Field must be one of: ${validListTypes.join(', ')}`,
        }
      }
    }
  }

  const recordGroups = new Map<string, Flatfile.RecordsWithLinks>()
  let processedCount = 0

  await processRecords(
    sheetId,
    async (
      records: Flatfile.RecordsWithLinks,
      pageNumber?: number,
      totalPageCount?: number
    ) => {
      for (const record of records) {
        const compositeKey = mergeKeys
          .map((key) => String(record.values[key]?.value || ''))
          .join('|')

        if (!recordGroups.has(compositeKey)) {
          recordGroups.set(compositeKey, [])
        }
        recordGroups.get(compositeKey)!.push(record)
      }

      processedCount += records.length
      const progress = Math.min((pageNumber / totalPageCount) * 50, 49)
      await tick(
        progress,
        `Processed ${processedCount} records on page ${pageNumber} of ${totalPageCount}`
      )
    }
  )

  const mergedRecords: Flatfile.Record_[] = []
  let groupCount = 0
  const totalGroups = recordGroups.size

  for (const [compositeKey, groupRecords] of recordGroups) {
    if (groupRecords.length > 1) {
      const mergedRecord = mergeRecordGroup(
        groupRecords,
        mergeKeys,
        nonKeyFields,
        opts
      )
      mergedRecords.push(mergedRecord)
    } else {
      mergedRecords.push(groupRecords[0])
    }

    groupCount++
    const progress = 50 + Math.min((groupCount / totalGroups) * 49, 49)
    await tick(progress, `Merged ${groupCount} of ${totalGroups} record groups`)
  }

  await updateAllRecords(
    sheetId,
    mergedRecords,
    async (progress, part, totalParts) => {
      await tick(
        99 + progress,
        `Updating records: part ${part} of ${totalParts}`
      )
    }
  )

  const mergedGroupCount = Array.from(recordGroups.values()).filter(
    (group) => group.length > 1
  ).length
  return {
    info: `Successfully merged ${mergedGroupCount} groups of records. Total records after merge: ${mergedRecords.length}`,
  }
}

function mergeRecordGroup(
  records: Flatfile.RecordsWithLinks,
  mergeKeys: string[],
  nonKeyFields: Flatfile.Property[],
  opts: PluginOptions
): Flatfile.Record_ {
  const baseRecord = records[0]
  const mergedValues = { ...baseRecord.values }

  for (const field of nonKeyFields) {
    const treatment = opts.treatments?.[field.key] || {
      type: opts.defaultTreatment || 'overwrite',
    }

    if (treatment.type === 'list') {
      const allValues = records
        .map((r) => r.values[field.key]?.value)
        .filter((v) => v != null && v !== '')

      mergedValues[field.key] = {
        value: allValues.length > 0 ? allValues : null,
      } as any
    } else {
      const heuristic = treatment.heuristic || opts.overwriteHeuristic || 'last'

      if (heuristic === 'first') {
        for (const record of records) {
          const value = record.values[field.key]?.value
          if (value != null && value !== '') {
            mergedValues[field.key] = { value }
            break
          }
        }
      } else if (heuristic === 'last') {
        for (let i = records.length - 1; i >= 0; i--) {
          const value = records[i].values[field.key]?.value
          if (value != null && value !== '') {
            mergedValues[field.key] = { value }
            break
          }
        }
      } else if (heuristic === 'custom' && opts.custom) {
        const customValue = opts.custom(records, mergeKeys.join('|'), field.key)
        mergedValues[field.key] = { value: customValue }
      }
    }
  }

  return {
    ...baseRecord,
    values: mergedValues,
  }
}
