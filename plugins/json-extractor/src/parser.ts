import type { WorkbookCapture } from '@flatfile/util-extractor'

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

    // Custom flatten function
    const flattenObject = (obj: any, parent: string = '', res: any = {}) => {
      for (let key in obj) {
        const propName = parent ? parent + '.' + key : key
        if (typeof obj[key] === 'object') {
          flattenObject(obj[key], propName, res)
        } else {
          res[propName] = obj[key]
        }
      }
      return res
    }

    // Flatten the first item to determine headers
    const firstItem = flattenObject(filteredResults[0])
    const headers = Object.keys(firstItem).filter((header) => header !== '')

    // Flatten and filter all rows
    const filteredData = filteredResults.map((row) => {
      const flattedRow = flattenObject(row)
      return headers.reduce(
        (filteredRow: Record<string, Object>, header: string) => {
          const cell = flattedRow[header]
          filteredRow[header] = {
            value: Array.isArray(cell) ? JSON.stringify(cell) : cell,
          }
          return filteredRow
        },
        {}
      )
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
