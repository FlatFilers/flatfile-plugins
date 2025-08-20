import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import { processRecords } from '@flatfile/util-common'
import { keepFirst } from './keep.first.logic'
import { keepLast } from './keep.last.logic'
import {
  RecordWithSource,
  generateMergeKey,
  mergeRecordsWithPriority,
} from './multi-file.utils'

const api = new FlatfileClient()

/**
 * Plugin config options.
 *
 * @property {string} on - field key to match on
 * @property {string} keep - "first" | "last"
 * @property {function} custom - custom dedupe function
 * @property {boolean} debug - show helpful messages useful for debugging (usage intended for development)
 * @property {object} multiFile - multi-file deduplication options
 */
export interface PluginOptions {
  readonly on?: string
  readonly keep?: 'first' | 'last'
  readonly custom?: (
    records: Flatfile.RecordsWithLinks,
    uniques: Set<unknown>
  ) => Array<string>
  readonly debug?: boolean
  readonly multiFile?: {
    /** Enable multi-file deduplication across workbook */
    enabled: boolean
    /** File priority mapping - higher numbers = higher priority */
    filePriorities?: Record<string, number>
    /** Include file attribution in merged records */
    includeAttribution?: boolean
    /** Merge strategy for multi-file deduplication */
    mergeStrategy?: 'delete' | 'merge' | 'union'
  }
}

export const dedupe = async (
  event: FlatfileEvent,
  tick: TickFunction,
  opts: PluginOptions
): Promise<void | Flatfile.JobCompleteDetails> => {
  const { sheetId, workbookId } = event.context

  if (opts.multiFile?.enabled) {
    return await dedupeMultiFile(event, tick, opts)
  }

  if (!sheetId) {
    throw new Error('Dedupe must be called from a sheet-level action')
  }

  await tick(0, 'Dedupe started')
  const coreKeepOptionSelected = ['first', 'last'].includes(opts.keep)
  if (coreKeepOptionSelected && opts.on === undefined) {
    throw new Error(`\`on\` is required when \`keep\` is ${opts.keep}`)
  }

  if (coreKeepOptionSelected && opts.on !== undefined) {
    const {
      data: {
        config: { fields },
      },
    } = await api.sheets.get(sheetId)
    const field = fields.find((f) => f.key === opts.on)
    if (field === undefined) {
      throw new Error(`Field "${opts.on}" not found`)
    }
  }

  let uniques = new Set()
  let duplicates: string[] = []
  await processRecords(
    sheetId,
    async (
      records: Flatfile.RecordsWithLinks,
      pageNumber?: number,
      totalPageCount?: number
    ) => {
      let removeThese: string[] = []
      if (opts.keep === 'first') {
        removeThese = keepFirst(records, opts.on, uniques)
      } else if (opts.keep === 'last') {
        removeThese = keepLast(records, opts.on, uniques)
      } else if (opts.custom) {
        removeThese = opts.custom(records, uniques)
      }
      duplicates = duplicates.concat(removeThese)

      const progress = Math.min((pageNumber / totalPageCount) * 100, 99)
      await tick(
        progress,
        `Processing ${records.length} records on page ${pageNumber} of ${totalPageCount}`
      )
    }
  )

  if (duplicates.length === 0) {
    return { info: 'No duplicates found' }
  }

  await api.jobs.create({
    type: 'workbook',
    operation: 'delete-records',
    trigger: 'immediate',
    source: workbookId,
    config: {
      sheet: sheetId,
      filter: 'none',
      exceptions: duplicates,
    },
  })

  return { info: 'Successfully removed duplicates' }
}

async function dedupeMultiFile(
  event: FlatfileEvent,
  tick: TickFunction,
  opts: PluginOptions
): Promise<Flatfile.JobCompleteDetails> {
  const { workbookId } = event.context

  if (!workbookId) {
    throw new Error('Multi-file dedupe requires workbook context')
  }

  if (!opts.on) {
    throw new Error('Field key "on" is required for multi-file deduplication')
  }

  await tick(0, 'Starting multi-file deduplication')

  const { data: sheets } = await api.sheets.list({ workbookId })

  const allRecords: RecordWithSource[] = []
  const filePriorities = opts.multiFile?.filePriorities || {}

  for (const sheet of sheets) {
    await tick(10, `Processing sheet: ${sheet.name}`)

    const priority = filePriorities[sheet.name] || filePriorities[sheet.id] || 0

    await processRecords(sheet.id, async (records) => {
      for (const record of records) {
        const recordWithSource: RecordWithSource = {
          ...record,
          _source: {
            sheetId: sheet.id,
            sheetName: sheet.name,
            priority,
          },
        }
        allRecords.push(recordWithSource)
      }
    })
  }

  await tick(50, 'Grouping and merging records')

  const groupedRecords = new Map<string, RecordWithSource[]>()

  for (const record of allRecords) {
    const key = generateMergeKey(record, opts.on)
    if (!key) continue

    if (!groupedRecords.has(key)) {
      groupedRecords.set(key, [])
    }
    groupedRecords.get(key)!.push(record)
  }

  const recordsToDelete: string[] = []
  const recordsToUpdate: Array<{ id: string; values: any }> = []

  for (const [_, group] of groupedRecords) {
    if (group.length > 1) {
      const mergedRecord = mergeRecordsWithPriority(
        group,
        opts.multiFile?.mergeStrategy || 'merge'
      )

      for (const record of group) {
        if (record.id !== mergedRecord.id) {
          recordsToDelete.push(record.id)
        }
      }

      if (opts.multiFile?.includeAttribution) {
        mergedRecord.values._sources = {
          value: group.map((r) => r._source?.sheetName).join(', '),
        }
      }

      recordsToUpdate.push({
        id: mergedRecord.id,
        values: mergedRecord.values,
      })
    }
  }

  await tick(80, 'Applying changes')

  if (recordsToDelete.length > 0) {
    await api.jobs.create({
      type: 'workbook',
      operation: 'delete-records',
      trigger: 'immediate',
      source: workbookId,
      config: {
        filter: 'none',
        exceptions: recordsToDelete,
      },
    })
  }

  for (const update of recordsToUpdate) {
    await api.records.update(update.id, update.values)
  }

  await tick(100, 'Multi-file deduplication complete')

  return {
    info: `Successfully processed ${allRecords.length} records, merged ${recordsToDelete.length} duplicates across ${sheets.length} files`,
  }
}
