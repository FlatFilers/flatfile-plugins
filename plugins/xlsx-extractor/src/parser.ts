import * as XLSX from 'xlsx'
import { mapKeys, mapValues } from 'remeda'
import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'

export function parseBuffer(
  buffer: Buffer,
  options?: {
    rawNumbers?: boolean
  }
): WorkbookCapture {
  const workbook = XLSX.read(buffer, {
    type: 'buffer',
    cellDates: true,
  })

  return mapValues(workbook.Sheets, (value, key) => {
    return convertSheet(value, options?.rawNumbers || false)
  })
}

/**
 * Convert a template sheet using a special template format
 *
 * @param sheet
 */
function convertSheet(
  sheet: XLSX.WorkSheet,
  rawNumbers: boolean
): SheetCapture {
  let rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    header: 'A',
    defval: null,
    rawNumbers: rawNumbers || false,
  })

  const { headerRow, skip } = detectHeader(rows)
  rows.splice(0, skip)

  const headers = mapValues(headerRow, (val) =>
    val?.toString().replace('*', '')
  )
  const required = mapValues(headerRow, (val) => val?.toString().includes('*'))
  const data = rows.map((row) => mapKeys(row, (key) => headers[key]))
  return {
    headers: Object.values(headers).filter((v) => v) as string[],
    required: mapKeys(required, (k) => headers[k]),
    data: data.map((row: Record<string, any>) => {
      return mapValues(row, (value) => ({ value }))
    }),
  }
}

const detectHeader = (
  rows: Record<string, any>[]
): { headerRow: Record<string, string>; skip: number } => {
  const ROWS_TO_CHECK = 10

  let skip = 0
  let widestRow: Record<string, string> = {}
  rows.forEach((row, i) => {
    if (i > ROWS_TO_CHECK) {
      return
    }
    if (countNonEmptyCells(row) > countNonEmptyCells(widestRow)) {
      widestRow = row
      skip = i + 1
    }
  })

  return { headerRow: widestRow, skip }
}

export const countNonEmptyCells = (row: Record<string, string>): number => {
  return Object.values(row).filter(
    (cell) => cell && cell.toString().trim() !== ''
  ).length
}

/**
 * This needs to be improved but right now it looks for a pattern unlikely
 * to be in a header.
 *
 * Yes header | foo | bar | baz |
 * No header  | 99  | asd | 0   |
 *
 * @param header
 */
function isHeaderCandidate(header: Record<string, string | number>): boolean {
  if (!header) {
    return false
  }

  // rule out anything that contains a pure number or non-string
  return !Object.values(header).some((v) =>
    typeof v === 'string' ? /^[0-9]+$/.test(v) : !!v
  )
}
