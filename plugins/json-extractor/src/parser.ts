import { WorkbookCapture, parseSheet } from '@flatfile/util-extractor'

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

    var sheetCapture = parseSheet(results);

    if (isEmpty(sheetCapture)) {
      return {} as WorkbookCapture
    }

    return {
      [sheetName]: sheetCapture,
    } as WorkbookCapture
  } catch (error) {
    console.error('An error occurred:', error)
    throw error
  }
}

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true;
}