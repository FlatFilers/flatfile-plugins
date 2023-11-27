import { WorkbookCapture } from '@flatfile/util-extractor'
import { flatten } from 'flat'

export function parseBuffer(buffer: Buffer): WorkbookCapture {
  try {
    const fileContents = buffer.toString('utf8')
    const sheetName = 'Sheet1'

    if (!fileContents) {
      console.log('Invalid file contents')
      return {} as WorkbookCapture
    }

    const parsedData = JSON.parse(fileContents) || []
    const results = Array.isArray(parsedData) ? parsedData : [parsedData]

    // Ensure all items are objects
    const filteredResults = results.filter(
      (item) => typeof item === 'object' && item !== null
    )

    if (filteredResults.length === 0) {
      return {} as WorkbookCapture
    }

    // Flatten the first item to determine headers
    const firstItem = flatten(filteredResults[0], { safe: true })
    const headers = Object.keys(firstItem).filter((header) => header !== '')

    // Flatten and filter all rows once
    const filteredData = filteredResults.map((row) => {
      const flattedRow = flatten(row, { safe: true })
      return headers.reduce((filteredRow, header) => {
        const cell = flattedRow[header]
        filteredRow[header] = {
          value: Array.isArray(cell) ? JSON.stringify(cell) : cell,
        }
        return filteredRow
      }, {})
    })

    return {
      [sheetName]: {
        headers,
        data: filteredData,
      },
    } as WorkbookCapture
  } catch (error) {
    console.error('An error occurred:', error)
    throw error
  }
}
