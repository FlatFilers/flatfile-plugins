import * as fs from 'node:fs'
import path from 'node:path'
import { type Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'
import { logError, logInfo, processRecords } from '@flatfile/util-common'
import * as XLSX from 'xlsx'
import type { PluginOptions } from './options'
import {
  createXLSXSheetOptions,
  sanitize,
  sanitizeExcelSheetName,
} from './utils'

const api = new FlatfileClient()

import { name as PACKAGE_NAME } from '../package.json'

/**
 * Runs extractor and creates an `.xlsx` file with all Flatfile Workbook data.
 *
 * @param event - Flatfile event
 * @param options - plugin config options
 * @param tick - a function to update job progress
 */
export const exportRecords = async (
  event: FlatfileEvent,
  options: PluginOptions,
  tick: TickFunction
): Promise<Flatfile.JobCompleteDetails> => {
  const { environmentId, spaceId, workbookId } = event.context

  try {
    await tick(1, 'Starting Excel export job')

    const { data: workbook } = await api.workbooks.get(workbookId)
    const { data: sheets } = await api.sheets.list({ workbookId })
    const sanitizedName = sanitize(workbook.name)

    if (options.debug) {
      const meta = sheets.reduce((acc, sheet) => {
        return acc + `\n\t'${sheet.name}' (${sheet.id})`
      }, '')

      logInfo(PACKAGE_NAME, `Sheets found in Flatfile workbook: ${meta}`)
    }

    const xlsxWorkbook = XLSX.utils.book_new()

    for (const [sheetIndex, sheet] of sheets.entries()) {
      if (options.excludedSheets?.includes(sheet.config.slug)) {
        if (options.debug) {
          logInfo(PACKAGE_NAME, `Skipping sheet: ${sheet.name}`)
        }
        continue
      }

      const columnNameTransformer = options.columnNameTransformer
        ? async (name: string, event?: FlatfileEvent) => {
            const result = await options.columnNameTransformer(
              name,
              sheet.config.slug,
              event
            )
            return result ?? name
          }
        : async (name: string) => name

      // Build the ordered list of blueprint field keys, excluding any
      // fields the caller wants omitted.  This is the canonical column
      // order shown in the review screen.
      const blueprintFields = sheet.config.fields.filter(
        (f) => !options.excludeFields?.includes(f.key)
      )

      // Pre-compute the transformed header names in blueprint order so
      // we can pass them to json_to_sheet as an explicit `header` array.
      // When a columnNameTransformer produces duplicate names (e.g. two
      // different field keys both labelled "Employee ID"), we must keep
      // only the *first* occurrence.  Object.fromEntries used below to
      // build each row already collapses duplicate keys (last-wins), so
      // a second header entry with no matching data would create a ghost
      // column.  Deduplicating here keeps the header in sync with the
      // row objects.
      const blueprintHeaderRaw = await Promise.all(
        blueprintFields.map((f) => columnNameTransformer(f.key, event))
      )
      const seenHeaders = new Set<string>()
      const blueprintHeader = blueprintHeaderRaw.filter((name) => {
        if (seenHeaders.has(name)) {
          return false
        }
        seenHeaders.add(name)
        return true
      })

      const blueprintKeySet = new Set(blueprintFields.map((f) => f.key))

      try {
        let results = await processRecords(
          sheet.id,
          async (records): Promise<Flatfile.RecordWithLinks[]> => {
            const processedRecords = await Promise.all(
              records.map(async (record: Flatfile.RecordWithLinks) => {
                const { id: recordId, values: row } = record

                const formatCell = (cellValue: Flatfile.CellValue) => {
                  const { value, messages } = cellValue
                  const cell: XLSX.CellObject = {
                    t: 's',
                    v: Array.isArray(value) ? value.join(', ') : value,
                    c: [],
                  }
                  if (options.excludeMessages) {
                    cell.c = []
                  } else if (messages.length > 0) {
                    cell.c = messages.map((m) => ({
                      a: 'Flatfile',
                      t: `[${m.type.toUpperCase()}]: ${m.message}`,
                      T: true,
                    }))
                    cell.c.hidden = true
                  }

                  return cell
                }

                // Iterate fields in blueprint order so the resulting
                // object key order matches the review screen.
                const rowEntries = await Promise.all(
                  blueprintFields.map(async (field) => {
                    const colName = field.key
                    const cellValue = row[colName]
                    if (!cellValue) {
                      return null
                    }
                    const transformedColName = await columnNameTransformer(
                      colName,
                      event
                    )
                    return [transformedColName, formatCell(cellValue)]
                  })
                )

                // Append any extra columns present in the record that
                // are NOT in the blueprint (e.g. user-added fields when
                // allowAdditionalFields is true).
                const extraEntries = await Promise.all(
                  Object.keys(row)
                    .filter((k) => !blueprintKeySet.has(k))
                    .filter((k) => !options.excludeFields?.includes(k))
                    .map(async (colName) => {
                      const transformedColName = await columnNameTransformer(
                        colName,
                        event
                      )
                      return [transformedColName, formatCell(row[colName])]
                    })
                )

                const rowValue = Object.fromEntries(
                  [...rowEntries, ...extraEntries].filter(
                    (entry) => entry !== null
                  )
                )

                return options?.includeRecordIds
                  ? {
                      recordId,
                      ...rowValue,
                    }
                  : rowValue
              })
            )
            return processedRecords
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

          const emptyRowEntries = await Promise.all(
            sheet.config.fields.map(async (field) => [
              await columnNameTransformer(field.key, event),
              emptyCell,
            ])
          )

          results = [[Object.fromEntries(emptyRowEntries)]]
        }
        const rows = results.flat()

        const worksheet = XLSX.utils.json_to_sheet(rows, {
          ...createXLSXSheetOptions(options.sheetOptions?.[sheet.config.slug]),
          header: [
            ...(options?.includeRecordIds ? ['recordId'] : []),
            ...blueprintHeader,
          ],
        })

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
          PACKAGE_NAME,
          `Failed to fetch records for sheet with id: ${sheet.id}`
        )

        throw new Error(
          `Failed to fetch records for sheet with id: ${sheet.id}`
        )
      }
    }

    // Lambdas only allow writing to /tmp directory
    const timestamp = new Date().toISOString()
    const fileName = options.filename
      ? `${options.filename}.xlsx`
      : `${sanitizedName}-${timestamp}.xlsx`
    const filePath = path.join('/tmp', fileName)

    if (xlsxWorkbook.SheetNames.length === 0) {
      if (options.debug) {
        logError(PACKAGE_NAME, 'No data to write to Excel file')
      }

      throw new Error('No data to write to Excel file.')
    }

    try {
      XLSX.set_fs(fs)
      XLSX.writeFile(xlsxWorkbook, filePath, { compression: true })

      await tick(80, 'Excel file written to disk')

      if (options.debug) {
        logInfo(PACKAGE_NAME, 'File written to disk')
      }
    } catch (_) {
      logError(PACKAGE_NAME, 'Failed to write file to disk')

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
          PACKAGE_NAME,
          `Excel document uploaded. View file at https://spaces.flatfile.com/space/${spaceId}/files?mode=export`
        )
      }
    } catch (_) {
      logError(PACKAGE_NAME, 'Failed to upload file')

      throw new Error('Failed uploading Excel file to Flatfile.')
    }

    if (options.debug) {
      logInfo(PACKAGE_NAME, 'Done')
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
    logError(PACKAGE_NAME, error)

    throw new Error((error as Error).message)
  }
}
