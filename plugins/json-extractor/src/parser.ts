import { Flatfile } from '@flatfile/api'

export function parseBuffer(buffer: Buffer): WorkbookCapture {
  try {
    const fileContents = buffer.toString('utf8')
    const sheetName = 'Sheet1'

    if (!fileContents) {
      console.log('Invalid file contents')
      return {} as WorkbookCapture
    }

    const results: Array<Record<string, string>> = JSON.parse(fileContents)

    if (!results || !results.length) {
      console.log('No data found in the file')
      return {} as WorkbookCapture
    }

    const headers = Object.keys(results[0]).filter((header) => header !== '')

    const filteredData = results.map((row: Record<string, any>) => {
      const filteredRow: Record<string, any> = {}
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
