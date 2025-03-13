import type { ExportSheetOptions } from './options'
import type { JSON2SheetOpts } from 'xlsx'

export function sanitize(fileName: string): string {
  // List of invalid characters that are commonly not allowed in file names
  const invalidChars = /[\/\?%\*:|"<>]/g

  // Remove invalid characters
  let cleanFileName = fileName.replace(invalidChars, '_')

  // Remove emojis and other non-ASCII characters
  cleanFileName = cleanFileName.replace(/[^\x00-\x7F]/g, '')

  return cleanFileName
}

export function sanitizeExcelSheetName(name: string, index: number): string {
  // Regular expression to match unsupported Excel characters
  const invalidChars = /[\\\/\?\*\[\]:<>|"]/g

  // Remove unsupported characters and trim leading or trailing spaces
  let sanitized = name.replace(invalidChars, '').trim()

  // Remove leading or trailing apostrophes
  sanitized = sanitized.replace(/^'+|'+$/g, '')

  // Truncate to 31 characters, the maximum length for Excel sheet names
  if (sanitized.length > 31) {
    sanitized = sanitized.substring(0, 31)
  }

  // If the sheet name is empty, use a default name based on index (i.e. "Sheet1")
  if (sanitized.length === 0) {
    sanitized = `Sheet${index + 1}` //index is 0-based, default sheet names should be 1-based
  }

  return sanitized
}

/**
 * Generates the alpha pattern ["A", "B", ... "AA", "AB", ..., "AAA", "AAB", ...] to help
 * with accessing cells in a worksheet.
 *
 * @param length - multiple of 26
 */
export const genCyclicPattern = (length: number = 104): Array<string> => {
  let alphaPattern: Array<string> = []

  for (let i = 0; i < length; i++) {
    let columnName = ''
    let j = i
    while (j >= 0) {
      columnName = String.fromCharCode(65 + (j % 26)) + columnName // 65 is ASCII for 'A'
      j = Math.floor(j / 26) - 1
    }
    alphaPattern.push(columnName)
  }

  return alphaPattern
}

/**
 * Convert sheetOptions to JSON2SheetOpts.
 *
 * @param sheetOptions Sheet options
 */
export function createXLSXSheetOptions(
  sheetOptions?: ExportSheetOptions
): JSON2SheetOpts {
  const options: JSON2SheetOpts = {}

  if (sheetOptions?.origin) {
    if (typeof sheetOptions.origin === 'number') {
      options.origin = sheetOptions.origin
    } else if (
      'column' in sheetOptions.origin &&
      'row' in sheetOptions.origin
    ) {
      options.origin = {
        c: sheetOptions.origin.column,
        r: sheetOptions.origin.row,
      }
    }
  }

  if (sheetOptions?.skipColumnHeaders) {
    options.skipHeader = true
  }
  return options
}
