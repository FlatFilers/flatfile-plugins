import { Flatfile } from '@flatfile/api'
import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { mapKeys, mapValues } from 'remeda'
import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import { GetHeadersOptions, Headerizer } from './header.detection'

export async function parseBuffer(
  buffer: Buffer,
  options?: {
    raw?: boolean
    rawNumbers?: boolean
    headerDetectionOptions?: GetHeadersOptions
  }
): Promise<WorkbookCapture> {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
  })
  const sheetNames = Object.keys(workbook.Sheets)

  const processedSheets = await Promise.all(
    sheetNames.map(async (sheetName) => {
      const value = workbook.Sheets[sheetName]
      const processedValue = await convertSheet(
        value,
        options?.rawNumbers || false,
        options?.raw || false,
        options?.headerDetectionOptions || {
          algorithm: 'default',
        }
      )
      return [sheetName, processedValue]
    })
  )

  return Object.fromEntries(processedSheets)
}

/**
 * Convert a template sheet using a special template format
 *
 * @param sheet
 */
async function convertSheet(
  sheet: XLSX.WorkSheet,
  rawNumbers: boolean = false,
  raw: boolean = false,
  headerDetectionOptions?: GetHeadersOptions
): Promise<SheetCapture> {
  let rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 'A',
    defval: null,
    rawNumbers,
    raw,
  })

  const extractValues = (data: Record<string, any>[]) =>
    data.map((row) => Object.values(row).filter((value) => value !== null))

  const headerizer = Headerizer.create(headerDetectionOptions)
  const headerStream = Readable.from(extractValues(rows))
  const { header, skip } = await headerizer.getHeaders(headerStream)
  rows.splice(0, skip)

  const toExcelHeader = (data: string[], keys: string[]) =>
    data.reduce((result, value, index) => {
      result[keys[index]] = value
      return result
    }, {})

  const columnKeys = Object.keys(rows[0])
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

function prependNonUniqueHeaderColumns(
  record: Record<string, string>
): Record<string, string> {
  const counts: Record<string, number> = {}
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(record)) {
    const cleanValue = value?.toString().replace('*', '')
    if (cleanValue && counts[value]) {
      result[key] = `${cleanValue}_${counts[value]}`
      counts[value]++
    } else {
      result[key] = cleanValue
      counts[value] = 1
    }
  }

  return result
}

const isNullOrWhitespace = (value: any) =>
  value === null || (typeof value === 'string' && value.trim() === '')
