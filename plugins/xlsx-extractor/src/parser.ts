import type { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { mapKeys, mapValues } from 'remeda'
import { Readable } from 'stream'
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
import {
  GetHeadersOptions,
  GetHeadersResult,
  ROWS_TO_SEARCH_FOR_HEADER,
} from '../constants/headerDetection.const'

type ParseBufferOptions = Omit<
  ExcelExtractorOptions,
  'chunkSize' | 'parallel'
> & {
  readonly headerSelectionEnabled?: boolean
  getHeaders: (options: any, data: string[][]) => Promise<GetHeadersResult>
  rowsToSearch?: number
}
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
  // Step 1: Extract raw data from Excel sheet
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 'A',
    defval: null,
    rawNumbers,
    raw,
    blankrows: headerSelectionEnabled || !skipEmptyLines,
  })

  if (rawRows.length === 0) {
    return
  }

  // Extract Excel column letters (A, B, C, etc.)
  const excelColumnLetters = Object.keys(rawRows[0])

  // Convert to array of arrays for easier processing
  let dataRows = rawRows.map((row) => Object.values(row))

  // Remove trailing empty rows
  while (
    dataRows.length > 0 &&
    dataRows[dataRows.length - 1].every(isNullOrWhitespace)
  ) {
    dataRows.pop()
  }

  if (dataRows.length === 0) {
    if (debug) {
      console.log(`No data rows found in '${sheetName}'`)
    }
    return
  }

  // Step 2: Prepare data for header detection
  let headerCandidateRows = [...dataRows.slice(0, rowsToSearch)]

  // Apply header cascading if enabled
  if (shouldCascadeHeaderValues) {
    headerCandidateRows = cascadeHeaderValues(headerCandidateRows)
    if (debug) {
      console.log(`Applied cascadeHeaderValues to '${sheetName}'`)
    }
  }

  // Convert nulls to empty strings for header detection
  const headerDetectionData = headerCandidateRows.map((row) =>
    row.map((cell) => (cell === null ? '' : String(cell)))
  )

  // Step 3: Detect headers
  const { headerRow: rowsToSkip, header: detectedHeaderRow } = await getHeaders(
    headerDetectionOptions,
    headerDetectionData
  )

  if (debug) {
    console.log(`@debug Detected ${rowsToSkip} rows to skip`)
    console.log(`@debug Detected header row:`, detectedHeaderRow)
  }

  // Remove trailing empty cells from detected header
  const cleanedDetectedHeader = trimTrailingEmptyCells(detectedHeaderRow)

  if (debug) {
    console.log(`@debug Cleaned detected header:`, cleanedDetectedHeader)
  }

  // Step 4: Process data rows based on header selection mode
  let finalDataRows = dataRows

  if (!headerSelectionEnabled) {
    // In normal mode, remove the header rows from data
    finalDataRows = dataRows.slice(rowsToSkip)
  }

  if (finalDataRows.length === 0) {
    if (debug) {
      console.log(
        `@debug No data rows remaining after header processing in '${sheetName}'`
      )
    }
    return
  }

  // Apply row value cascading if enabled
  if (shouldCascadeRowValues) {
    finalDataRows = cascadeRowValues(finalDataRows)
    if (debug) {
      console.log(`@debug Applied cascadeRowValues to '${sheetName}'`)
    }
  }

  // Step 5: Determine final headers
  let finalHeaders: string[]

  if (headerSelectionEnabled) {
    // In header selection mode, use Excel column letters but limit to detected header length
    finalHeaders = excelColumnLetters.slice(0, cleanedDetectedHeader.length)
  } else {
    // In normal mode, use the detected header values
    finalHeaders = cleanedDetectedHeader
  }

  // Handle duplicate headers by appending numbers
  const uniqueHeaders = prependNonUniqueHeaderColumns(finalHeaders)
  if (debug) {
    console.log('@debug uniqueHeaders', uniqueHeaders)
  }

  if (uniqueHeaders.length === 0) {
    if (debug) {
      console.log(`@debug No headers found in '${sheetName}'`)
    }
    return
  }

  // Step 6: Convert data to Flatfile format
  const flatfileData = finalDataRows.map((row) =>
    row.reduce((acc, value, index) => {
      const headerName = uniqueHeaders[index]
      if (headerName) {
        acc[headerName] = { value }
      }
      return acc
    }, {})
  )

  // Step 7: Build metadata if needed
  let sheetMetadata: { rowHeaders: number[] } | undefined = undefined
  if (headerSelectionEnabled) {
    sheetMetadata = {
      rowHeaders: [rowsToSkip],
    }
  }

  return {
    headers: uniqueHeaders,
    data: flatfileData,
    metadata: sheetMetadata,
  }
}
