import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import { extractExcelOptions } from '.'
import { GetHeadersOptions, Headerizer } from './header.detection'
import { prependNonUniqueHeaderColumns } from './utils'

type ParseBufferOptions = Omit<
  extractExcelOptions,
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
      throw new Error(
        'File is too large to parse. Try converting this file to CSV.'
      )
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
          const sheet = workbook.Sheets[sheetName]
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
    throw new Error('Failed to parse workbook')
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

  // return if there are no rows
  if (!rows || rows.length === 0) {
    if (debug) {
      console.log(`No rows found in '${sheetName}'`)
    }
    return
  }

  const extractValues = (data: Record<string, any>[]) =>
    data.map((row) => Object.values(row))

  const headerizer = Headerizer.create(headerDetectionOptions)
  const headerStream = Readable.from(extractValues(rows))
  const { skip, header } = await headerizer.getHeaders(headerStream)
  const headerKey = Math.max(0, skip - 1)
  const columnKeys = Object.keys(rows[headerKey])

  if (debug) {
    console.log('Detected header:', header)
  }

  if (!headerSelectionEnabled) rows.splice(0, skip)

  // return if there are no rows
  if (rows.length === 0) {
    if (debug) {
      console.log(`No rows found in '${sheetName}'`)
    }
    return
  }

  const toExcelHeader = (data: string[], keys: string[]) =>
    data.reduce((result, value, index) => {
      result[keys[index]] = value
      return result
    }, {})
  const columnHeaders = headerSelectionEnabled ? columnKeys : header
  const excelHeader = toExcelHeader(columnHeaders, columnKeys)
  const headers = prependNonUniqueHeaderColumns(excelHeader)

  while (
    rows.length > 0 &&
    Object.values(rows[rows.length - 1]).every(isNullOrWhitespace)
  ) {
    rows.pop()
  }

  const data = rows.map((row) => {
    const newRow: Record<string, { value: any }> = {}
    for (const [key, value] of Object.entries(row)) {
      const newKey = headers[key as keyof typeof headers]
      newRow[newKey] = { value }
    }
    return newRow
  })

  let metadata: { rowHeaders: number[] } | undefined = undefined
  if (headerSelectionEnabled) {
    metadata = {
      rowHeaders: [skip],
    }
  }

  return {
    headers: Object.values(headers).filter(Boolean),
    data,
    metadata,
  }
}

const isNullOrWhitespace = (value: any) =>
  value === null || (typeof value === 'string' && value.trim() === '')
