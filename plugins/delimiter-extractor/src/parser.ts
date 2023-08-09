import { Flatfile } from '@flatfile/api'
import Papa, { ParseResult } from 'papaparse'
import { WorkbookCapture } from '@flatfile/util-extractor'
import { mapKeys, mapValues } from 'remeda'

export function parseBuffer(
  buffer: Buffer,
  options: {
    delimiter: string
    dynamicTyping?: boolean
    skipEmptyLines?: boolean | 'greedy'
    transform?: (value: any) => Flatfile.CellValueUnion
  }
): WorkbookCapture {
  try {
    const fileContents = buffer.toString('utf8')
    const results: ParseResult<Record<string, string>> = Papa.parse(
      fileContents,
      {
        delimiter: options.delimiter,
        dynamicTyping: options?.dynamicTyping || false,
        header: false,
        skipEmptyLines: options?.skipEmptyLines || 'greedy',
      }
    )

    const rows = results.data
    if (!rows || !rows.length) {
      console.log('No data found in the file')
      return {} as WorkbookCapture
    }
    const transform = options?.transform || ((value) => value)

    const { headerRow, skip } = detectHeader(rows)
    rows.splice(0, skip)

    const headers = mapValues(headerRow, (val) =>
      val?.toString().replace('*', '')
    )
    const required = mapValues(headerRow, (val) =>
      val?.toString().includes('*')
    )
    const data = rows
      .map((row) => mapKeys(row, (key) => headers[key]))
      .map((row: Record<string, any>) => {
        return mapValues(row, (value) => ({ value: transform(value) }))
      })

    const sheetName = 'Sheet1'
    return {
      [sheetName]: {
        headers: Object.values(headers).filter((v) => v) as string[],
        required: mapKeys(required, (k) => headers[k]),
        data,
      },
    } as WorkbookCapture
  } catch (error) {
    console.log('An error occurred:', error)
    throw error
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

const countNonEmptyCells = (row: Record<string, string>): number => {
  return Object.values(row).filter(
    (cell) => cell && cell.toString().trim() !== ''
  ).length
}
