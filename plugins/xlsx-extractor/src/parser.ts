import type { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { mapKeys, mapValues } from 'remeda'
import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import type { ExcelExtractorOptions } from '.'
import { type GetHeadersOptions, Headerizer } from './header.detection'
import { processMergedCells } from './merged-cells'
import {
  cascadeHeaderValues,
  cascadeRowValues,
  isNullOrWhitespace,
  prependNonUniqueHeaderColumns,
  trimTrailingEmptyCells,
} from './utils'

type ParseBufferOptions = Omit<
  ExcelExtractorOptions,
  'chunkSize' | 'parallel'
> & { readonly headerSelectionEnabled?: boolean }
type ProcessedSheet = [PropertyKey, SheetCapture]

/**
 * Shared workbook parsing logic to avoid duplicate parsing
 */
function parseWorkbook(
  buffer: Buffer,
  options?: ParseBufferOptions
): XLSX.WorkBook {
  try {
    // Try normal parsing first (most common case)
    return XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
      dense: true,
      dateNF: options?.dateNF || undefined,
    })
  } catch (e) {
    // If we get a string too long error, provide a helpful message
    if (
      e.message?.includes('string longer than') ||
      e.code === 'ERR_STRING_TOO_LONG'
    ) {
      if (options?.debug) {
        console.log(
          'File is too large to parse. Try converting this file to CSV.'
        )
      }
      throw new Error('plugins.extraction.fileTooLarge')
    }

    // For other errors, try with WTF option to get better error details
    try {
      return XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true,
        dense: true,
        dateNF: options?.dateNF || undefined,
        WTF: true,
      })
    } catch (wtfError) {
      // If WTF parsing also fails, check for the specific error again
      if (wtfError.code === 'ERR_STRING_TOO_LONG') {
        if (options?.debug) {
          console.log(
            'File is too large to parse. Try converting this file to CSV.'
          )
        }
        throw new Error('plugins.extraction.fileTooLarge')
      }
      // Re-throw the original error if it's not the string length issue
      throw e
    }
  }
}

export async function parseBuffer(
  buffer: Buffer,
  options?: ParseBufferOptions
): Promise<WorkbookCapture> {
  const workbook = parseWorkbook(buffer, options)

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
        cascadeHeaderValues: options?.cascadeHeaderValues,
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
  let headerRows = [...rowsAsArrays]
  if (shouldCascadeHeaderValues) {
    headerRows = cascadeHeaderValues(headerRows)
    if (debug) {
      console.log(`Applied cascadeHeaderValues to '${sheetName}'`)
    }
  }

  const headerizer = Headerizer.create(headerDetectionOptions)
  const headerStream = Readable.from(headerRows)
  const { skip, header } = await headerizer.getHeaders(headerStream)
  const slicedHeader = trimTrailingEmptyCells(header)

  if (debug) {
    console.log('Detected header:', slicedHeader)
  }

  if (!headerSelectionEnabled) rowsAsArrays.splice(0, skip)

  // return if there are no rows
  if (rowsAsArrays.length === 0) {
    if (debug) {
      console.log(`No rows found in '${sheetName}'`)
    }
    return
  }

  // Apply cascadeRowValues if enabled
  if (shouldCascadeRowValues) {
    rowsAsArrays = cascadeRowValues(rowsAsArrays)
    if (debug) {
      console.log(`Applied cascadeRowValues to '${sheetName}'`)
    }
  }

  const columnHeaders = headerSelectionEnabled
    ? excelHeaders.slice(0, slicedHeader.length)
    : slicedHeader
  const headers = prependNonUniqueHeaderColumns(columnHeaders)

  if (headers.length === 0) {
    if (debug) {
      console.log(`No headers found in '${sheetName}'`)
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


