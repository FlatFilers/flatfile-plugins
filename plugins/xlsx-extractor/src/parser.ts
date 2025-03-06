import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { mapKeys, mapValues } from 'remeda'
import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import { ExcelExtractorOptions } from '.'
import { GetHeadersOptions, Headerizer } from './header.detection'
import { processMergedCells } from './merged-cells'
import {
  isNullOrWhitespace,
  prependNonUniqueHeaderColumns,
  trimTrailingEmptyCells,
} from './utils'

type ParseBufferOptions = Omit<
  ExcelExtractorOptions,
  'chunkSize' | 'parallel'
> & { readonly headerSelectionEnabled?: boolean }
type ProcessedSheet = [PropertyKey, SheetCapture]

export async function parseBuffer(
  buffer: Buffer,
  options?: ParseBufferOptions
): Promise<WorkbookCapture> {
  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
      dense: true,
      dateNF: options?.dateNF || undefined,
      // SheetJS intends the 'WTF' option to be used for development purposes only.
      // We use it here to specifically capture the ERR_STRING_TOO_LONG error.
      WTF: true,
    })
  } catch (e) {
    // catch the error if the file is too large to parse, and throw a more helpful error.
    // ref: https://docs.sheetjs.com/docs/miscellany/errors/#invalid-string-length-or-err_string_too_long
    // i.e. 'Cannot create a string longer than 0x1fffffe8 characters'
    if (e.code === 'ERR_STRING_TOO_LONG') {
      if (options?.debug) {
        console.log(
          'File is too large to parse. Try converting this file to CSV.'
        )
      }
      throw new Error('plugins.extraction.fileTooLarge')
    }

    // Try reading the file again without the 'WTF' option.
    workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
      dense: true,
      dateNF: options?.dateNF || undefined,
    })
  }

  const sheetNames = Object.keys(workbook.Sheets)
  try {
    const processedSheets = (
      await Promise.all(
        sheetNames.map(async (sheetName) => {
          let sheet = workbook.Sheets[sheetName]

          // Process merged cells if options are provided
          if (options?.mergedCellOptions) {
            if (options?.debug) {
              console.log(`Processing merged cells in sheet '${sheetName}'`)
            }
            sheet = processMergedCells(sheet, options)
          }

          const processedSheet = await convertSheet({
            sheet,
            sheetName,
            rawNumbers: options?.rawNumbers || false,
            raw: options?.raw || false,
            headerDetectionOptions: options?.headerDetectionOptions || {
              algorithm: 'default',
            },
            headerSelectionEnabled: options?.headerSelectionEnabled ?? false,
            skipEmptyLines: options?.skipEmptyLines ?? false,
            debug: options?.debug,
          })
          if (!processedSheet) {
            return
          }
          return [sheetName, processedSheet]
        })
      )
    ).filter(Boolean) as ProcessedSheet[]
    return Object.fromEntries(processedSheets)
  } catch (e) {
    console.error(e)
    throw new Error('plugins.extraction.failedToParseWorkbook')
  }
}

type ConvertSheetArgs = {
  sheet: XLSX.WorkSheet
  sheetName: string
  rawNumbers: boolean
  raw: boolean
  headerDetectionOptions: GetHeadersOptions
  headerSelectionEnabled: boolean
  skipEmptyLines: boolean
  debug?: boolean
}

/**
 * Convert a template sheet using a special template format
 *
 * @param sheet
 */
async function convertSheet({
  sheet,
  sheetName,
  rawNumbers,
  raw,
  headerDetectionOptions,
  headerSelectionEnabled,
  skipEmptyLines,
  debug,
}: ConvertSheetArgs): Promise<SheetCapture | undefined> {
  let rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 'A',
    defval: null,
    rawNumbers,
    raw,
    blankrows: headerSelectionEnabled || !skipEmptyLines,
  })

  if (rows.length === 0) {
    return
  }

  const excelHeaders = Object.keys(rows[0])

  // Convert rows to an array of arrays
  rows = rows.map((row) => Object.values(row))

  // remove **trailing** empty rows
  while (rows.length > 0 && rows[rows.length - 1].every(isNullOrWhitespace)) {
    rows.pop()
  }

  // return if there are no rows
  if (!rows || rows.length === 0) {
    if (debug) {
      console.log(`No rows found in '${sheetName}'`)
    }
    return
  }

  const headerizer = Headerizer.create(headerDetectionOptions)
  const headerStream = Readable.from(rows)
  const { skip, header } = await headerizer.getHeaders(headerStream)
  const slicedHeader = trimTrailingEmptyCells(header)

  if (debug) {
    console.log('Detected header:', slicedHeader)
  }

  if (!headerSelectionEnabled) rows.splice(0, skip)

  // return if there are no rows
  if (rows.length === 0) {
    if (debug) {
      console.log(`No rows found in '${sheetName}'`)
    }
    return
  }

  const columnHeaders = headerSelectionEnabled
    ? excelHeaders.slice(0, slicedHeader.length)
    : slicedHeader
  const headers = prependNonUniqueHeaderColumns(columnHeaders)

  // Convert rows to Flatfile Record format
  const data = rows.map((row) =>
    row.reduce((acc, value, index) => {
      const header = headers[index]
      if (header) {
        acc[header] = { value }
      }
      return acc
    }, {})
  )

  let metadata: { rowHeaders: number[] } | undefined = undefined
  if (headerSelectionEnabled) {
    metadata = {
      rowHeaders: [skip],
    }
  }

  return {
    headers,
    data,
    metadata,
  }
}
