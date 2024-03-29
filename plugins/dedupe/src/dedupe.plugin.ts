import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { processRecords } from '@flatfile/util-common'
import { keepFirst } from './keep.first.logic'
import { keepLast } from './keep.last.logic'

/**
 * Plugin config options.
 *
 * @property {string} on - field key to match on
 * @property {string} keep - "first" | "last"
 * @property {function} custom - custom dedupe function
 * @property {boolean} debug - show helpful messages useful for debugging (usage intended for development)
 */
export interface PluginOptions {
  readonly on?: string
  readonly keep?: 'first' | 'last'
  readonly custom?: (
    records: Flatfile.RecordsWithLinks,
    uniques: Set<unknown>
  ) => Array<string>
  readonly debug?: boolean
}

export const dedupe = async (
  event: FlatfileEvent,
  tick: (progress: number, message?: string) => Promise<Flatfile.JobResponse>,
  opts: PluginOptions
): Promise<void | Flatfile.JobCompleteDetails> => {
  const { sheetId, workbookId } = event.context

  await tick(0, 'Dedupe started')
  const coreKeepOptionSelected = ['first', 'last'].includes(opts.keep)
  if (coreKeepOptionSelected && opts.on === undefined) {
    throw new Error('`on` is required when `keep` is `${opts.keep}`')
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
