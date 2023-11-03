import { Flatfile } from '@flatfile/api'
import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { mapKeys, mapValues } from 'remeda'
import * as XLSX from 'xlsx'

export function parseBuffer(
  buffer: Buffer,
  options?: {
    raw?: boolean
    rawNumbers?: boolean
  }
): WorkbookCapture {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
  })

  return mapValues(workbook.Sheets, (value, key) => {
    return convertSheet(
      value,
      options?.rawNumbers || false,
      options?.raw || false
    )
  })
}

/**
 * Convert a template sheet using a special template format
 *
 * @param sheet
 */
function convertSheet(
  sheet: XLSX.WorkSheet,
  rawNumbers: boolean,
  raw: boolean
): SheetCapture {
  let rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 'A',
    defval: null,
    rawNumbers: rawNumbers || false,
    raw: raw || false,
  })

  const { headerRow, skip } = detectHeader(rows)
  rows.splice(0, skip)

  const headers = prependNonUniqueHeaderColumns(headerRow)
  const required: Record<string, boolean> = {}
  Object.keys(headerRow).forEach((key) => {
    const newKey = headers[key]
    if (newKey) {
      required[newKey] = headerRow[key]?.toString().includes('*') ?? false
    }
  })

  const data: Flatfile.RecordData[] = rows
    .filter((row) => !Object.values(row).every(isNullOrWhitespace))
    .map((row) => {
      const mappedRow = mapKeys(row, (key) => headers[key])
      return mapValues(mappedRow, (value) => ({
        value: value,
      })) as Flatfile.RecordData
    })

  return {
    headers: Object.values(headers).filter((v) => v) as string[],
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

const detectHeader = (
  rows: Record<string, any>[]
): { headerRow: Record<string, string>; skip: number } => {
  const ROWS_TO_CHECK = 10

  let skip = 0
  let widestRow: Record<string, string> = {}
  let widestRowCount = 0

  for (let i = 0; i < Math.min(rows.length, ROWS_TO_CHECK); i++) {
    const row = rows[i]
    const rowCount = countNonEmptyCells(row)
    if (rowCount > widestRowCount) {
      widestRow = row
      widestRowCount = rowCount
      skip = i + 1
    }
  }

  return { headerRow: widestRow, skip }
}

const countNonEmptyCells = (row: Record<string, string>): number => {
  return Object.values(row).filter(
    (cell) => cell && cell.toString().trim() !== ''
  ).length
}
