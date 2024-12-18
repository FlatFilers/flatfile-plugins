import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { FlatfileTickFunction } from '../../record-hook/src'

import { FlatfileClient } from '@flatfile/api'
import { logError, logInfo, processRecords } from '@flatfile/util-common'
import * as fs from 'fs'
import path from 'path'
import * as R from 'remeda'
import * as XLSX from 'xlsx'
import { sanitize, sanitizeExcelSheetName } from './utils'

const api = new FlatfileClient()

/**
 * Plugin config options.
 *
 * @property {string} jobName - name of the job
 * @property {string[]} excludedSheets - list of sheet names to exclude from the exported data.
 * @property {string[]} excludeFields - list of field names to exclude from the exported data. This applies to all sheets.
 * @property {Flatfile.Filter} recordFilter - filter to apply to the records before exporting.
 * @property {boolean} includeRecordIds - include record ids in the exported data.
 * @property {boolean} autoDownload - auto download the file after exporting
 * @property {boolean} debug - show helpul messages useful for debugging (use intended for development).
 */
export interface PluginOptions {
  readonly jobName?: string
  readonly excludedSheets?: string[]
  readonly excludeFields?: string[]
  readonly recordFilter?: Flatfile.Filter
  readonly includeRecordIds?: boolean
  readonly autoDownload?: boolean
  readonly debug?: boolean
}

/**
 * Runs extractor and creates an `.xlsx` file with all Flatfile Workbook data.
 *
 * @param event - Flatfile event
 * @param options - plugin config options
 */
export const exportRecords = async (
  event: FlatfileEvent,
  options: PluginOptions,
  tick: FlatfileTickFunction
): Promise<void | Flatfile.JobCompleteDetails> => {
  const { environmentId, spaceId, workbookId } = event.context

  try {
    await tick(1, 'Starting Excel export job')

    const { data: workbook } = await api.workbooks.get(workbookId)
    const { data: sheets } = await api.sheets.list({ workbookId })
    const sanitizedName = sanitize(workbook.name)

    if (options.debug) {
      const meta = R.pipe(
        sheets,
        R.reduce((acc, sheet) => {
          return acc + `\n\t'${sheet.name}' (${sheet.id})`
        }, '')
      )

      logInfo(
        '@flatfile/plugin-export-workbook',
        `Sheets found in Flatfile workbook: ${meta}`
      )
    }

    const xlsxWorkbook = XLSX.utils.book_new()

    for (const [sheetIndex, sheet] of sheets.entries()) {
      if (options.excludedSheets?.includes(sheet.config.slug)) {
        if (options.debug) {
          logInfo(
            '@flatfile/plugin-export-workbook',
            `Skipping sheet: ${sheet.name}`
          )
        }
        continue
      }
      try {
        let results = await processRecords<Record<string, any>[]>(
          sheet.id,
          (records): Record<string, any>[] => {
            return R.pipe(
              records,
              R.map(
                ({
                  id: recordId,
                  values: row,
                }: {
                  id: string
                  values: any
                }) => {
                  const rowValue = R.pipe(
                    Object.keys(row),
                    R.reduce((acc, colName) => {
                      if (options.excludeFields?.includes(colName)) {
                        return acc
                      }
                      const formatCell = (cellValue: Flatfile.CellValue) => {
                        const { value, messages } = cellValue
                        const cell: XLSX.CellObject = {
                          t: 's',
                          v: Array.isArray(value) ? value.join(', ') : value,
                          c: [],
                        }
                        if (R.length(messages) > 0) {
                          cell.c = messages.map((m) => ({
                            a: 'Flatfile',
                            t: `[${m.type.toUpperCase()}]: ${m.message}`,
                            T: true,
                          }))
                          cell.c.hidden = true
                        }

                        return cell
                      }

                      return {
                        ...acc,
                        [colName]: formatCell(row[colName]),
                      }
                    }, {})
                  )
                  return options?.includeRecordIds
                    ? {
                        recordId,
                        ...rowValue,
                      }
                    : rowValue
                }
              )
            )
          },
          {
            filter: options.recordFilter,
          }
        )
        if (!results || results.every((group) => group.length === 0)) {
          const emptyCell: XLSX.CellObject = {
            t: 's',
            v: '',
            c: [],
          }
          results = [
            sheet.config.fields.map((field) => ({ [field.key]: emptyCell })),
          ]
        }
        const rows = results.flat()

        const worksheet = XLSX.utils.json_to_sheet(rows)

        XLSX.utils.book_append_sheet(
          xlsxWorkbook,
          worksheet,
          sanitizeExcelSheetName(sheet.name, sheetIndex)
        )
        await tick(
          Math.round(((sheetIndex + 1) / sheets.length) * 70),
          `${sheet.name} Prepared`
        )
      } catch (_) {
        logError(
          '@flatfile/plugin-export-workbook',
          `Failed to fetch records for sheet with id: ${sheet.id}`
        )

        throw new Error(
          `Failed to fetch records for sheet with id: ${sheet.id}`
        )
      }
    }

    // Lambdas only allow writing to /tmp directory
    const timestamp = new Date().toISOString()
    const fileName = `${sanitizedName}-${timestamp}.xlsx`
    const filePath = path.join('/tmp', fileName)

    if (xlsxWorkbook.SheetNames.length === 0) {
      if (options.debug) {
        logError(
          '@flatfile/plugin-export-workbook',
          'No data to write to Excel file'
        )
      }

      throw new Error('No data to write to Excel file.')
    }

    try {
      XLSX.set_fs(fs)
      XLSX.writeFile(xlsxWorkbook, filePath)

      await tick(80, 'Excel file written to disk')

      if (options.debug) {
        logInfo('@flatfile/plugin-export-workbook', 'File written to disk')
      }
    } catch (_) {
      logError(
        '@flatfile/plugin-export-workbook',
        'Failed to write file to disk'
      )

      throw new Error('Failed writing the Excel file to disk.')
    }

    let fileId: string
    try {
      const reader = fs.createReadStream(filePath)

      const { data: file } = await api.files.upload(reader, {
        spaceId,
        environmentId,
        mode: 'export',
      })
      fileId = file.id

      await tick(90, 'Excel file uploaded to Flatfile')

      reader.close()

      await fs.promises.unlink(filePath)

      if (options.debug) {
        logInfo(
          '@flatfile/plugin-export-workbook',
          `Excel document uploaded. View file at https://spaces.flatfile.com/space/${spaceId}/files?mode=export`
        )
      }
    } catch (_) {
      logError('@flatfile/plugin-export-workbook', 'Failed to upload file')

      throw new Error('Failed uploading Excel file to Flatfile.')
    }

    if (options.debug) {
      logInfo('@flatfile/plugin-export-workbook', 'Done')
    }

    return options.autoDownload
      ? {
          outcome: {
            heading: 'Success!',
            message:
              'Data was successfully written to Excel file and uploaded. The download should start automatically.',
            next: {
              type: 'files',
              files: [{ fileId }],
            },
          },
        }
      : {
          outcome: {
            acknowledge: true,
            message:
              'Data was successfully written to Excel file and uploaded. You can access the workbook in the "Available Downloads" section of the Files page in Flatfile.',
            next: {
              type: 'id',
              id: spaceId,
              path: 'files',
              query: 'mode=export',
              label: 'See all downloads',
            },
          },
        }
  } catch (error) {
    logError('@flatfile/plugin-export-workbook', error)

    throw new Error((error as Error).message)
  }
}
