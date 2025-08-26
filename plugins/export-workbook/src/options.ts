import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'

/**
 * A sheet address.
 *
 * @property {number} column - The column component
 * @property {number} row - The row component
 */
export interface SheetAddress {
  column: number
  row: number
}

/**
 * Sheet specific options.
 *
 * @property {number | SheetAddress} origin - The sheet origin
 * @property {boolean} skipColumnHeaders - If true, do not include column row in output
 */
export interface ExportSheetOptions {
  origin?: number | SheetAddress
  skipColumnHeaders?: boolean
}

export type ColumnNameTransformerCallback = (
  columnName: string,
  sheetSlug: string,
  event?: FlatfileEvent
) => string | Promise<string>

/**
 * Plugin config options.
 *
 * @property {string} jobName - name of the job
 * @property {string[]} excludedSheets - list of sheet names to exclude from the exported data.
 * @property {string[]} excludeFields - list of field names to exclude from the exported data. This applies to all sheets.
 * @property {boolean} excludeMessages - exclude record messages from the exported data.
 * @property {Flatfile.Filter} recordFilter - filter to apply to the records before exporting.
 * @property {boolean} includeRecordIds - include record ids in the exported data.
 * @property {boolean} autoDownload - auto download the file after exporting
 * @property {string} filename - filename to use for the exported file.
 * @property {boolean} debug - show helpful messages useful for debugging (use intended for development).
 * @property {Record<string, ExportSheetOptions>} sheetOptions - map of sheet slug to ExportSheetOptions.
 * @property {ColumnNameTransformerCallback} columnNameTransformer - callback to transform column names.
 */
export interface PluginOptions {
  readonly jobName?: string
  readonly excludedSheets?: string[]
  readonly excludeFields?: string[]
  readonly excludeMessages?: boolean
  readonly recordFilter?: Flatfile.Filter
  readonly includeRecordIds?: boolean
  readonly autoDownload?: boolean
  readonly filename?: string
  readonly debug?: boolean
  readonly sheetOptions?: Record<string, ExportSheetOptions>
  readonly columnNameTransformer?: ColumnNameTransformerCallback
}
