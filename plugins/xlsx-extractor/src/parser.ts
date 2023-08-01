import * as XLSX from 'xlsx'
import { mapKeys, mapValues } from 'remeda'
import { Flatfile } from '@flatfile/api'

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

  // use a basic pattern check on the 1st row - should be switched to core header detection
  const hasHeader = isHeaderCandidate(rows[0])

  const colMap: Record<string, string> | null = hasHeader
    ? (rows.shift() as Record<string, string>)
    : null

  if (colMap) {
    const headers = mapValues(colMap, (val) => val?.replace('*', ''))
    const required = mapValues(colMap, (val) => val?.includes('*'))
    const data = rows.map((row) => mapKeys(row, (key) => headers[key]))
    return {
      headers: Object.values(headers).filter((v) => v) as string[],
      required: mapKeys(required, (k) => headers[k]),
      data: data.map((row: Record<string, any>) => {
        return mapValues(row, (value) => ({ value }))
      }),
    }
  } else {
    return { headers: Object.keys(rows[0]), data: rows }
  }
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

/**
 * Generic structure for capturing a workbook
 */
export type WorkbookCapture = Record<string, SheetCapture>

/**
 * Generic structure for capturing a sheet
 */
export type SheetCapture = {
  headers: string[]
  required?: Record<string, boolean>
  descriptions?: Record<string, null | string> | null
  data: Flatfile.RecordData[]
}
