import type { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import * as XLSX from 'xlsx'
import type { ExcelExtractorOptions } from '.'
import { processMergedCells } from './merged-cells'
import {
  cascadeHeaderValues,
  cascadeRowValues,
  isNullOrWhitespace,
  prependNonUniqueHeaderColumns,
  trimTrailingEmptyCells,
} from './utils'
import { GetHeadersOptions, GetHeadersResult, ROWS_TO_SEARCH_FOR_HEADER } from '../constants/headerDetection.const'


type ParseBufferOptions = Omit<
  ExcelExtractorOptions,
  'chunkSize' | 'parallel'
> & { readonly headerSelectionEnabled?: boolean, 
  getHeaders: (options: any, data: string[][]) => Promise<GetHeadersResult>,
  rowsToSearch?: number
}
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

  // Process merged cells if options are provided
  if (options?.mergedCellOptions) {
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      workbook.Sheets[sheetName] = processMergedCells(sheet, options)
    }
  }

  // Process each sheet
  const processedSheets = await Promise.all(
    workbook.SheetNames.map(async (sheetName) => {
      const sheet = workbook.Sheets[sheetName]
      const sheetCapture = await convertSheet({
        sheet,
        sheetName,
        rawNumbers: options?.rawNumbers ?? false,
        raw: options?.raw ?? false,
        headerDetectionOptions: options?.headerDetectionOptions ?? {
          algorithm: 'default',
        },
        headerSelectionEnabled: options?.headerSelectionEnabled ?? false,
        skipEmptyLines: options?.skipEmptyLines ?? false,
        debug: options?.debug,
        cascadeRowValues: options?.cascadeRowValues,
        rowsToSearch: options?.rowsToSearch ?? ROWS_TO_SEARCH_FOR_HEADER,
        cascadeHeaderValues: options?.cascadeHeaderValues,
        getHeaders: options?.getHeaders,
      })
      return [sheetName, sheetCapture] as ProcessedSheet
    })
  )

  // Filter out undefined sheets and convert to an object
  return processedSheets.reduce((acc, [sheetName, sheetCapture]) => {
    if (sheetCapture) {
      acc[sheetName as string] = sheetCapture
    }
    return acc
  }, {} as WorkbookCapture)
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
  cascadeRowValues?: boolean
  cascadeHeaderValues?: boolean
  rowsToSearch?: number
  getHeaders: (options: any, data: string[][]) => Promise<GetHeadersResult>
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
  cascadeRowValues: shouldCascadeRowValues,
  cascadeHeaderValues: shouldCascadeHeaderValues,
  rowsToSearch,
  getHeaders,
}: ConvertSheetArgs): Promise<SheetCapture | undefined> {
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
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
  let rowsAsArrays = rows.map((row) => Object.values(row))

  // remove **trailing** empty rows
  while (
    rowsAsArrays.length > 0 &&
    rowsAsArrays[rowsAsArrays.length - 1].every(isNullOrWhitespace)
  ) {
    rowsAsArrays.pop()
  }

  // return if there are no rows
  if (!rowsAsArrays || rowsAsArrays.length === 0) {
    if (debug) {
      console.log(`No rows found in '${sheetName}'`)
    }
    return
  }

  // Apply cascadeHeaderValues if enabled
  let headerRows = [...rowsAsArrays.slice(0, rowsToSearch)]
  if (shouldCascadeHeaderValues) {
    headerRows = cascadeHeaderValues(headerRows)
    if (debug) {
      console.log(`Applied cascadeHeaderValues to '${sheetName}'`)
    }
  }

  const nullToStrings = headerRows.map((row) => row.map((cell) => cell === null ? '' : cell))
  const { skip, header } = await getHeaders(headerDetectionOptions, nullToStrings)

  if(debug) {
    console.log('@debug skip', skip)
    console.log('@debug header', header)
  }

  const slicedHeader = trimTrailingEmptyCells(header)

  if (debug) {
    console.log('@debug Detected header:', slicedHeader)
  }

  if (!headerSelectionEnabled) rowsAsArrays.splice(0, skip)

  // return if there are no rows
  if (rowsAsArrays.length === 0) {
    if (debug) {
      console.log(`@debug No rows found in '${sheetName}'`)
    }
    return
  }

  // Apply cascadeRowValues if enabled
  if (shouldCascadeRowValues) {
    rowsAsArrays = cascadeRowValues(rowsAsArrays)
    if (debug) {
      console.log(`@debug Applied cascadeRowValues to '${sheetName}'`)
    }
  }

  const columnHeaders = headerSelectionEnabled
    ? excelHeaders.slice(0, slicedHeader.length)
    : slicedHeader
  const headers = prependNonUniqueHeaderColumns(columnHeaders)

  if (headers.length === 0) {
    if (debug) {
      console.log(`@debug No headers found in '${sheetName}'`)
    }
    return
  }

  // Convert rows to Flatfile Record format
  const data = rowsAsArrays.map((row) =>
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
