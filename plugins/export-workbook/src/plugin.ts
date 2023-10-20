import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent } from '@flatfile/listener'
import { processRecords } from '@flatfile/util-common'
import * as XLSX from '@sheet/coredemo'
import * as fs from 'fs'
import * as R from 'remeda'

/**
 * Plugin config options.
 *
 * @property {boolean} includeRecordIds - include record ids in the exported data.
 * @property {boolean} debug - show helpul messages useful for debugging (use intended for development).
 */
export interface PluginOptions {
  readonly includeRecordIds?: boolean
  readonly debug?: boolean
}

/**
 * Runs extractor and creates an `.xlsx` file with all Flatfile Workbook data.
 *
 * @param event - Flatfile event
 * @param options - plugin config options
 */
export const run = async (
  event: FlatfileEvent,
  options: PluginOptions
): Promise<void> => {
  const { environmentId, jobId, spaceId, workbookId } = event.context

  try {
    const { data: sheets } = await api.sheets.list({ workbookId })

    if (options.debug) {
      const meta = R.pipe(
        sheets,
        R.reduce((acc, sheet) => {
          return acc + `\n\t'${sheet.name}' (${sheet.id})`
        }, '')
      )

      logInfo('Sheets found in Flatfile workbook:' + meta)
    }

    const workbook = XLSX.utils.book_new()

    try {
      await api.jobs.ack(jobId, {
        info: 'Starting job to write to Excel file',
        progress: 10,
      })

      for (const sheet of sheets) {
        try {
          const results = await processRecords(sheet.id, (records) => {
            return R.pipe(
              records,
              R.map(({ id, values: row }) => {
                const rowValue = R.pipe(
                  Object.keys(row),
                  R.reduce((acc, colName) => {
                    const formatCell = (cellValue: Flatfile.CellValue) => {
                      const { value, messages } = cellValue
                      const cell: XLSX.CellObject = { t: 's', v: value }
                      if (R.length(messages) > 0) {
                        cell.c = R.pipe(
                          messages,
                          R.map((m) => ({
                            a: 'Flatfile',
                            t: `[${m.type.toUpperCase()}]: ${m.message}`,
                          }))
                        )
                        cell.c.hidden = true
                        cell.s = getCellColorScheme(messages)
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
                      id,
                      ...rowValue,
                    }
                  : rowValue
              })
            )
          })
          const rows = results.flat()

          const worksheet = XLSX.utils.json_to_sheet(rows)
          worksheet['!protect'] = {}

          const columnCount = Object.keys(rows[0]).length
          const rowCount = rows.length

          // Bold the first row (header)
          const alphaColumnDesignations = genCyclicPattern(columnCount)
          XLSX.utils.sheet_set_range_style(
            worksheet,
            `A1:${alphaColumnDesignations[columnCount - 1]}1`,
            {
              bold: true,
              ...readonlyColorScheme,
            }
          )

          // Calculate editable columns directly from the sheet's configuration
          const editableFieldAlphaColumnDesignations = sheet.config.fields
            .map((field, index) => {
              // Check if a field is NOT read-only
              if (!field.readonly) {
                return alphaColumnDesignations[
                  options?.includeRecordIds ? index + 1 : index
                ]
              }
            })
            .filter(Boolean)

          // Remove 'A' column if `includeRecordIds` is true as it's considered read-only
          if (options?.includeRecordIds) {
            const index = editableFieldAlphaColumnDesignations.indexOf('A')
            if (index > -1) {
              editableFieldAlphaColumnDesignations.splice(index, 1)
            }
          }

          // Set editable columns to editable
          for (const columnDesignation of editableFieldAlphaColumnDesignations) {
            XLSX.utils.sheet_set_range_style(
              worksheet,
              `${columnDesignation}2:${columnDesignation}${rowCount}`,
              {
                editable: true,
              }
            )
          }

          const readonlyFieldAlphaColumnDesignations =
            alphaColumnDesignations.filter(
              (designation) =>
                !editableFieldAlphaColumnDesignations.includes(designation)
            )
          for (const columnDesignation of readonlyFieldAlphaColumnDesignations) {
            XLSX.utils.sheet_set_range_style(
              worksheet,
              `${columnDesignation}2:${columnDesignation}${rowCount}`,
              {
                ...readonlyColorScheme,
              }
            )
          }

          XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            // Limit sheet name to 31 characters
            sheet.name.substring(0, 31)
          )
        } catch (_getRecordsError: unknown) {
          logError('Failed to fetch records for sheet with id: ' + sheet.id)

          await api.jobs.fail(jobId, {
            outcome: {
              message: 'Failed to fetch records for sheet with id: ' + sheet.id,
            },
          })

          return
        }
      }
    } catch (_jobAckError: unknown) {
      logError('Failed to acknowledge job with id: ' + jobId)

      await api.jobs.fail(jobId, {
        outcome: {
          message: 'Failed to acknowledge job with id: ' + jobId,
        },
      })

      return
    }

    const fileName = `Workbook-${currentEpoch()}.xlsx`

    try {
      XLSX.writeFileXLSX(workbook, fileName, { cellStyles: true })

      if (options.debug) {
        logInfo('File written to disk')
      }
    } catch (_writeError: unknown) {
      logError('Failed to write file to disk')

      await api.jobs.fail(jobId, {
        outcome: {
          message:
            'Job failed because it could not write the Excel Workbook to disk.',
        },
      })

      return
    }

    try {
      const reader = fs.createReadStream(fileName)

      await api.files.upload(reader, {
        spaceId,
        environmentId,
        mode: 'export',
      })

      reader.close()

      await fs.promises.unlink(fileName)

      if (options.debug) {
        logInfo(
          `Excel document uploaded. View file at https://spaces.flatfile.com/space/${spaceId}/files?mode=export`
        )
      }
    } catch (_uploadError: unknown) {
      logError('Failed to upload file')

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
          message:
            'Data was successfully written to Excel file and uploaded. You can access the workbook in the "Available Downloads" section of the Files page in Flatfile.',
          next: {
            type: 'url',
            url: `/space/${spaceId}/files?mode=export`,
            label: 'Available Downloads',
          },
        },
      })

      if (options.debug) {
        logInfo('Done')
      }
    } catch (_jobError: unknown) {
      logError('Failed to complete job')

      await api.jobs.fail(jobId, {
        outcome: {
          message: 'Failed to complete job.',
        },
      })

      return
    }
  } catch (_fetchSheetsError: unknown) {
    logError('Failed to fetch sheets for workbook id: ' + workbookId)

    await api.jobs.fail(jobId, {
      outcome: {
        message: 'Failed to fetch sheets for workbook id: ' + workbookId,
      },
    })

    return
  }
}

type ColorScheme = {
  color?: { rgb: string }
  fgColor?: { rgb: string }
}

const errorRed: ColorScheme = {
  color: { rgb: '9c0007' },
  fgColor: { rgb: 'ffc7cd' },
}

const warningYellow: ColorScheme = {
  color: { rgb: '9c5700' },
  fgColor: { rgb: 'ffeb9c' },
}

const infoBlue: ColorScheme = {
  color: { rgb: '000000' },
  fgColor: { rgb: 'daeef3' },
}

const readonlyColorScheme: ColorScheme = {
  color: { rgb: '414857' },
  fgColor: { rgb: 'f6f8fc' },
}

function getCellColorScheme(
  messages: Flatfile.ValidationMessage[]
): ColorScheme | null {
  let severityRank: Record<Flatfile.ValidationType, number> = {
    error: 3,
    warn: 2,
    info: 1,
  }

  let maxSeverity = 0
  let mostSevereType: Flatfile.ValidationType | null = null

  for (const message of messages) {
    const currentSeverity = severityRank[message.type!]
    if (currentSeverity > maxSeverity) {
      maxSeverity = currentSeverity
      mostSevereType = message.type!
    }
  }

  switch (mostSevereType) {
    case 'error':
      return errorRed
    case 'warn':
      return warningYellow
    case 'info':
      return infoBlue
    default:
      return null // No color scheme for null type or unrecognized types
  }
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

const currentEpoch = (): string => {
  return `${Math.floor(Date.now() / 1000)}`
}

const logError = (msg: string): void => {
  console.error('[@flatfile/plugin-export-workbook]:[FATAL] ' + msg)
}

const logInfo = (msg: string): void => {
  console.log('[@flatfile/plugin-export-workbook]:[INFO] ' + msg)
}

const logWarn = (msg: string): void => {
  console.warn('[@flatfile/plugin-export-workbook]:[WARN] ' + msg)
}
