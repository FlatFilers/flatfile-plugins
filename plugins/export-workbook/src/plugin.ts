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

      try {
        const excludeFieldsSet = new Set(options.excludeFields ?? [])

        const transformCache = new Map<string, string>()
        const memoizedTransform = async (key: string) => {
          if (transformCache.has(key)) {
            return transformCache.get(key)!
          }
          const result = await columnNameTransformer(key, event)
          transformCache.set(key, result)
          return result
        }

        let headerMapping: Map<string, string> | null = null
        let orderedHeaders: string[] | null = null
        let labelCounts: Map<string, number> | null = null
        let extrasKeyToUniqueLabel: Map<string, string> | null = null
        let extrasHeaderOrder: string[] | null = null
        let blueprintKeysSet: Set<string> = new Set()

        if (options.followBlueprintOrder) {
          const blueprintKeys = sheet.config.fields
            .filter((field) => !excludeFieldsSet.has(field.key))
            .map((field) => field.key)

          const transformedLabels = await Promise.all(
            blueprintKeys.map(async (key) => {
              const label = await memoizedTransform(key)
              return { key, label }
            })
          )

          labelCounts = new Map<string, number>()
          headerMapping = new Map<string, string>()
          orderedHeaders = []
          extrasKeyToUniqueLabel = new Map<string, string>()
          extrasHeaderOrder = []

          for (const { key, label } of transformedLabels) {
            const count = labelCounts.get(label) || 0
            labelCounts.set(label, count + 1)

            const uniqueLabel = count > 0 ? `${label} (${key})` : label
            headerMapping.set(key, uniqueLabel)
            orderedHeaders.push(uniqueLabel)
          }

          blueprintKeysSet = new Set(headerMapping.keys())

          if (options.includeRecordIds) {
            orderedHeaders.unshift('recordId')
          }
        }

        let results = await processRecords(
          sheet.id,
          async (records): Promise<Flatfile.RecordWithLinks[]> => {
            const processedRecords = await Promise.all(
              records.map(async (record: Flatfile.RecordWithLinks) => {
                const { id: recordId, values: row } = record

                const formatCell = (
                  cellValue: Flatfile.CellValue | undefined
                ): XLSX.CellObject => {
                  if (!cellValue) {
                    return {
                      t: 's',
                      v: '',
                      c: [],
                    }
                  }
                  const { value, messages } = cellValue
                  const rawValue = Array.isArray(value)
                    ? value.join(', ')
                    : value

                  let c: any = []
                  if (!options.excludeMessages && messages.length > 0) {
                    c = messages.map((m) => ({
                      a: 'Flatfile',
                      t: `[${m.type.toUpperCase()}]: ${m.message}`,
                      T: true,
                    }))
                    c.hidden = true
                  }

                  if (typeof rawValue === 'number') {
                    return {
                      t: 'n',
                      v: rawValue,
                      c,
                    }
                  }

                  return {
                    t: 's',
                    v: rawValue,
                    c,
                  }
                }

                if (
                  options.followBlueprintOrder &&
                  headerMapping &&
                  labelCounts &&
                  extrasKeyToUniqueLabel &&
                  extrasHeaderOrder
                ) {
                  const rowValue: Record<string, XLSX.CellObject> = {}

                  for (const [key, uniqueLabel] of headerMapping.entries()) {
                    rowValue[uniqueLabel] = formatCell(row[key])
                  }

                  const additionalKeys = Object.keys(row).filter(
                    (key) =>
                      !blueprintKeysSet.has(key) && !excludeFieldsSet.has(key)
                  )

                  for (const key of additionalKeys) {
                    let uniqueLabel = extrasKeyToUniqueLabel.get(key)
                    if (!uniqueLabel) {
                      const baseLabel = await memoizedTransform(key)
                      const count = labelCounts.get(baseLabel) || 0
                      labelCounts.set(baseLabel, count + 1)
                      uniqueLabel =
                        count > 0 ? `${baseLabel} (${key})` : baseLabel
                      extrasKeyToUniqueLabel.set(key, uniqueLabel)
                      extrasHeaderOrder.push(uniqueLabel)
                    }
                    rowValue[uniqueLabel] = formatCell(row[key])
                  }

                  return options.includeRecordIds
                    ? {
                        recordId,
                        ...rowValue,
                      }
                    : rowValue
                } else {
                  const rowEntries = await Promise.all(
                    Object.keys(row).map(async (colName: string) => {
                      if (excludeFieldsSet.has(colName)) {
                        return null
                      }

                      const transformedColName =
                        await memoizedTransform(colName)
                      return [transformedColName, formatCell(row[colName])]
                    })
                  )

                  const rowValue = Object.fromEntries(
                    rowEntries.filter((entry) => entry !== null)
                  )

                  return options?.includeRecordIds
                    ? {
                        recordId,
                        ...rowValue,
                      }
                    : rowValue
                }
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
            sheet.config.fields
              .filter((f) => !excludeFieldsSet.has(f.key))
              .map(async (field) => [
                await memoizedTransform(field.key),
                emptyCell,
              ])
          )

          const emptyRow = Object.fromEntries(emptyRowEntries)
          if (options.includeRecordIds) {
            results = [[{ recordId: '', ...emptyRow }]]
          } else {
            results = [[emptyRow]]
          }
        }
        const rows = results.flat()

        const sheetOptions = createXLSXSheetOptions(
          options.sheetOptions?.[sheet.config.slug]
        )

        if (options.followBlueprintOrder && orderedHeaders) {
          if (extrasKeyToUniqueLabel && extrasKeyToUniqueLabel.size > 0) {
            const extrasKeysSorted = Array.from(
              extrasKeyToUniqueLabel.keys()
            ).sort()
            const extrasOrderedLabels = extrasKeysSorted.map(
              (k) => extrasKeyToUniqueLabel.get(k)!
            )
            orderedHeaders = orderedHeaders.concat(extrasOrderedLabels)
          }
          sheetOptions.header = orderedHeaders
        }

        const worksheet = XLSX.utils.json_to_sheet(rows, sheetOptions)

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
