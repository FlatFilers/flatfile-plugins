import { WorkbookCapture, parseSheet } from '@flatfile/util-extractor'


export function parseBuffer(buffer: Buffer): WorkbookCapture {
  try {
    const fileContents = buffer.toString('utf8')

    if (!fileContents) {
      console.error('Invalid file contents')
      return {} as WorkbookCapture
    }

    const parsedData = JSON.parse(fileContents)
    if (typeof parsedData !== 'object' || parsedData === null) {
      console.error("Invalid input: data must be an object.");
      return {} as WorkbookCapture;
    }

    const results: WorkbookCapture = {};

    Object.keys(parsedData).forEach(sheet => {
      const value = parsedData[sheet];

      // Check if key is a string and value is an array
      if (typeof sheet === 'string' && Array.isArray(value)) {
          try {
              const result = parseSheet(value);
              results[sheet] = result; // Store result in the results object
          } catch (error) {
              console.error(`Error processing sheet "${sheet}":`, error);
          }
      } else {
          console.warn(`Skipping key "${sheet}" - not a string/array pair.`);
      }
    });

    return results;
  } catch (error) {
    console.error('An error occurred:', error)
    throw error
  }
}
