import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'

import { FlatfileClient } from '@flatfile/api'
import { processRecords } from '@flatfile/util-common'
import { keepFirst } from './keep.first.logic'
import { keepLast } from './keep.last.logic'

const api = new FlatfileClient()

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

  if (!sheetId) {
    throw new Error('Dedupe must be called from a sheet-level action')
  }

  await tick(0, 'Dedupe started')
  const coreKeepOptionSelected =
    opts.keep && ['first', 'last'].includes(opts.keep)
  if (coreKeepOptionSelected && opts.on === undefined) {
    throw new Error(`\`on\` is required when \`keep\` is ${opts.keep}`)
  }

  if (coreKeepOptionSelected && opts.on !== undefined) {
    const {
      data: {
        config: { fields },
      },
    } = await api.sheets.get(sheetId)
    const field = fields.find((f: Flatfile.Property) => f.key === opts.on)
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
      if (opts.keep === 'first' && opts.on) {
        removeThese = keepFirst(records, opts.on, uniques)
      } else if (opts.keep === 'last' && opts.on) {
        removeThese = keepLast(records, opts.on, uniques)
      } else if (opts.custom) {
        removeThese = opts.custom(records, uniques)
      }
      duplicates = duplicates.concat(removeThese)

      if (pageNumber && totalPageCount) {
        const progress = Math.min((pageNumber / totalPageCount) * 100, 99)
        await tick(
          progress,
          `Processing ${records.length} records on page ${pageNumber} of ${totalPageCount}`
        )
      }
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
