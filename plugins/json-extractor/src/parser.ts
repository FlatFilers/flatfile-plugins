import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'

export function parseBuffer(
  buffer: Buffer,
  options?: { readonly fileExt?: string }
): WorkbookCapture {
  try {
    let fileContents = buffer.toString('utf8')

    if (!fileContents) {
      console.log('Invalid file contents')
      return {} as WorkbookCapture
    }

    if (options?.fileExt === 'jsonl' || options?.fileExt === 'jsonlines') {
      const lines = fileContents
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
          try {
            JSON.parse(line)
            return line
          } catch (e) {
            console.error('Invalid JSON line:', line)
            return null
          }
        })
        .filter((line) => line !== null)
      fileContents = `[${lines.join(',')}]`
    }

    const parsedData = JSON.parse(fileContents)
    if (typeof parsedData !== 'object' || parsedData === null) {
      console.error('Invalid input: data must be an object.')
      return {} as WorkbookCapture
    }

    const results: WorkbookCapture = {}
    const sheets = Array.isArray(parsedData)
      ? { Sheet1: parsedData }
      : parsedData

    for (const [sheet, value] of Object.entries(sheets)) {
      if (Array.isArray(value)) {
        try {
          results[sheet] = parseSheet(value)
        } catch (error) {
          console.error(`Error processing sheet "${sheet}":`, error)
        }
      }
    }

    return results
  } catch (error) {
    console.error('An error occurred:', error)
    throw error
  }
}

export function parseSheet(jsonArray: any[]): SheetCapture {
  try {
    // Ensure all items are objects
    const filteredResults = jsonArray.filter(
      (item) => typeof item === 'object' && item !== null
    )

    if (filteredResults.length === 0) {
      return {} as SheetCapture
    }

    // Custom flatten function that extracts all keys in an arbitrarily deep JSON object into headers,
    // where nested levels are separated by `.` in the final header
    // NOTE: The res input is mutated as part of this recursive function
    const flattenObject = (obj: any, parent: string = '', res: any = {}) => {
      for (let key in obj) {
        const propName = parent ? `${parent}.${key}` : key
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
      const flattenedRow = flattenObject(row)
      return headers.reduce((filteredRow, header) => {
        const cell = flattenedRow[header]
        filteredRow[header] = {
          value: Array.isArray(cell) ? JSON.stringify(cell) : cell,
        }
        return filteredRow
      }, {})
    })

    return {
      headers,
      data: filteredData,
    } as SheetCapture
  } catch (error) {
    console.error('An error occurred:', error)
    throw error
  }
}
