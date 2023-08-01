import { Flatfile } from '@flatfile/api'
import Papa, { ParseResult } from 'papaparse'

export function parseBuffer(
  buffer: Buffer,
  delimiter: string,
  options?: {
    dynamicTyping?: boolean
    hasHeader?: boolean
    skipEmptyLines?: boolean | 'greedy'
    transform?: (value: any) => Flatfile.CellValueUnion
  }
): WorkbookCapture {
  try {
    const fileContents = buffer.toString('utf8')
    const results: ParseResult<Record<string, string>> = Papa.parse(
      fileContents,
      {
        delimiter,
        dynamicTyping: options?.dynamicTyping || false,
        header: options?.hasHeader === false ? false : true,
        skipEmptyLines: options?.skipEmptyLines || 'greedy',
        transform: options?.transform || ((value) => value),
      }
    )

    const parsedData = results.data

    if (!parsedData || !parsedData.length) {
      console.log('No data found in the file')
      return {} as WorkbookCapture
    }

    const sheetName = 'Sheet1'

    const headers = Object.keys(parsedData[0]).filter((header) => header !== '')

    const filteredData = parsedData.map((row: Record<string, any>) => {
      const filteredRow: Flatfile.RecordData = {}
      for (const header of headers) {
        filteredRow[header] = { value: row[header] }
      }
      return filteredRow
    })

    return {
      [sheetName]: {
        headers,
        data: filteredData,
      },
    } as WorkbookCapture
  } catch (error) {
    console.log('An error occurred:', error)
    throw error
  }
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
