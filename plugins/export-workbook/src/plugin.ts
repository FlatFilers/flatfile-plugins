import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { logError, logInfo, processRecords } from '@flatfile/util-common'
import * as fs from 'fs'
import path from 'path'
import * as R from 'remeda'
import * as XLSX from 'xlsx'

/**
 * Plugin config options.
 *
 * @property {string[]} excludedSheets - list of sheet names to exclude from the exported data.
 * @property {string[]} excludeFields - list of field names to exclude from the exported data. This applies to all sheets.
 * @property {Flatfile.Filter} recordFilter - filter to apply to the records before exporting.
 * @property {boolean} includeRecordIds - include record ids in the exported data.
 * @property {boolean} debug - show helpul messages useful for debugging (use intended for development).
 */
export interface PluginOptions {
  readonly jobName?: string
  readonly excludedSheets?: string[]
  readonly excludeFields?: string[]
  readonly recordFilter?: Flatfile.Filter
  readonly includeRecordIds?: boolean
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
  options: PluginOptions
): Promise<void> => {
  const { environmentId, jobId, spaceId, workbookId } = event.context

  try {
    const { data: workbook } = await api.workbooks.get(workbookId)
    const { data: sheets } = await api.sheets.list({ workbookId })
    const fileName = sanitizeFileName(workbook.name)

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

    try {
      await api.jobs.ack(jobId, {
        info: 'Starting job to write to Excel file',
        progress: 10,
      })

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
                            v: value,
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
        } catch (_getRecordsError: unknown) {
          logError(
            '@flatfile/plugin-export-workbook',
            `Failed to fetch records for sheet with id: ${sheet.id}`
          )

          await api.jobs.fail(jobId, {
            outcome: {
              message: `Failed to fetch records for sheet with id: ${sheet.id}`,
            },
          })

          return
        }
      }
    } catch (_jobAckError: unknown) {
      logError(
        '@flatfile/plugin-export-workbook',
        `Failed to acknowledge job with id: ${jobId}`
      )

      await api.jobs.fail(jobId, {
        outcome: {
          message: `Failed to acknowledge job with id: ${jobId}`,
        },
      })

      return
    }

    // Lambdas only allow writing to /tmp directory
    const timestamp = new Date().toISOString()
    const filePath = path.join('/tmp', `${fileName}-${timestamp}.xlsx`)

    if (xlsxWorkbook.SheetNames.length === 0) {
      if (options.debug) {
        logError(
          '@flatfile/plugin-export-workbook',
          'No data to write to Excel file'
        )
      }

      await api.jobs.fail(jobId, {
        outcome: {
          message:
            'Job failed because there were no data to write to Excel file.',
        },
      })

      return
    }

    try {
      XLSX.set_fs(fs)
      XLSX.writeFile(xlsxWorkbook, filePath)

      if (options.debug) {
        logInfo('@flatfile/plugin-export-workbook', 'File written to disk')
      }
    } catch (_writeError: unknown) {
      logError(
        '@flatfile/plugin-export-workbook',
        'Failed to write file to disk'
      )

      await api.jobs.fail(jobId, {
        outcome: {
          message:
            'Job failed because it could not write the Excel Workbook to disk.',
        },
      })

      return
    }

    try {
      const reader = fs.createReadStream(filePath)

      await api.files.upload(reader, {
        spaceId,
        environmentId,
        mode: 'export',
      })

      reader.close()

      await fs.promises.unlink(filePath)

      if (options.debug) {
        logInfo(
          '@flatfile/plugin-export-workbook',
          `Excel document uploaded. View file at https://spaces.flatfile.com/space/${spaceId}/files?mode=export`
        )
      }
    } catch (_uploadError: unknown) {
      logError('@flatfile/plugin-export-workbook', 'Failed to upload file')

      await api.jobs.fail(jobId, {
        outcome: {
          message: 'Job failed because it could not upload Excel file.',
        },
      })

      return
    }

    try {
      await api.jobs.complete(jobId, {
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
      })

      if (options.debug) {
        logInfo('@flatfile/plugin-export-workbook', 'Done')
      }
    } catch (_jobError: unknown) {
      logError('@flatfile/plugin-export-workbook', 'Failed to complete job')

      await api.jobs.fail(jobId, {
        outcome: {
          message: 'Failed to complete job.',
        },
      })

      return
    }
  } catch (_fetchSheetsError: unknown) {
    logError(
      '@flatfile/plugin-export-workbook',
      `Failed to fetch sheets for workbook id: ${workbookId}`
    )

    await api.jobs.fail(jobId, {
      outcome: {
        message: `Failed to fetch sheets for workbook id: ${workbookId}`,
      },
    })

    return
  }
}

function sanitizeFileName(fileName: string): string {
  // List of invalid characters that are commonly not allowed in file names
  const invalidChars = /[\/\?%\*:|"<>]/g

  // Remove invalid characters
  let cleanFileName = fileName.replace(invalidChars, '_')

  // Remove emojis and other non-ASCII characters
  cleanFileName = cleanFileName.replace(/[^\x00-\x7F]/g, '')

  return cleanFileName
}

function sanitizeExcelSheetName(name: string, index: number): string {
  // Regular expression to match unsupported Excel characters
  const invalidChars = /[\\\/\?\*\[\]:<>|"]/g

  // Remove unsupported characters and trim leading or trailing spaces
  let sanitized = name.replace(invalidChars, '').trim()

  // Remove leading or trailing apostrophes
  sanitized = sanitized.replace(/^'+|'+$/g, '')

  // Truncate to 31 characters, the maximum length for Excel sheet names
  if (sanitized.length > 31) {
    sanitized = sanitized.substring(0, 31)
  }

  // If the sheet name is empty, use a default name based on index (i.e. "Sheet1")
  if (sanitized.length === 0) {
    sanitized = `Sheet${index + 1}` //index is 0-based, default sheet names should be 1-based
  }

  return sanitized
}

/**
 * Generates the alpha pattern ["A", "B", ... "AA", "AB", ..., "AAA", "AAB", ...] to help
 * with accessing cells in a worksheet.
 *
 * @param length - multiple of 26
 */
const genCyclicPattern = (length: number = 104): Array<string> => {
  let alphaPattern: Array<string> = []

  for (let i = 0; i < length; i++) {
    let columnName = ''
    let j = i
    while (j >= 0) {
      columnName = String.fromCharCode(65 + (j % 26)) + columnName // 65 is ASCII for 'A'
      j = Math.floor(j / 26) - 1
    }
    alphaPattern.push(columnName)
  }

  return alphaPattern
}
