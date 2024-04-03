import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { mapKeys, mapValues } from 'remeda'
import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import { ExcelExtractorOptions } from '.'
import { GetHeadersOptions, Headerizer } from './header.detection'
import { isNullOrWhitespace, prependNonUniqueHeaderColumns } from './utils'

type ParseBufferOptions = Omit<ExcelExtractorOptions, 'chunkSize' | 'parallel'>

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
    throw e
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
            debug: options?.debug,
          })
          if (!processedSheet) {
            return
          }
          return [sheetName, processedSheet]
        })
      )
    ).filter(Boolean) as [PropertyKey, SheetCapture][]
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
  debug,
}: ConvertSheetArgs): Promise<SheetCapture | undefined> {
  let rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 'A',
    defval: null,
    rawNumbers,
    raw,
  })

  // return if there are no rows
  if (!rows || rows.length === 0) {
    if (debug) {
      console.log(`No rows found in '${sheetName}'`)
    }
    return
  }

  const extractValues = (data: Record<string, any>[]) =>
    data.map((row) => Object.values(row).filter((value) => value !== null))

  const headerizer = Headerizer.create(headerDetectionOptions)
  const headerStream = Readable.from(extractValues(rows))
  const { header, skip } = await headerizer.getHeaders(headerStream)
  if (debug) {
    console.log('Detected header:', header)
  }
  const headerKey = Math.max(0, skip - 1)
  const columnKeys = Object.keys(rows[headerKey]).filter((key) =>
    Boolean(rows[headerKey][key])
  )

  rows.splice(0, skip)
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

  const excelHeader = toExcelHeader(header, columnKeys)
  const headers = prependNonUniqueHeaderColumns(excelHeader)
  const required = Object.fromEntries(
    Object.entries(excelHeader).map(([key, value]) => [
      headers[key],
      value?.toString().includes('*') ?? false,
    ])
  )

  const data = rows
    .filter((row) => !Object.values(row).every(isNullOrWhitespace))
    .map((row) =>
      mapValues(
        mapKeys(row, (key) => headers[key]),
        (value) => ({ value })
      )
    )

  return {
    headers: Object.values(headers).filter(Boolean),
    required,
    data,
  }
}
