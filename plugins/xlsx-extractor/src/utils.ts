export function prependNonUniqueHeaderColumns(headers: string[]): string[] {
  const counts = new Map<string, number>()

  return headers.map((value) => {
    const cleanValue = (value || 'empty').replace('*', '')
    const count = counts.get(cleanValue) || 0
    counts.set(cleanValue, count + 1)

    return count ? `${cleanValue}_${count}` : cleanValue
  })
}

export const isNullOrWhitespace = (value: any) =>
  value === null || (typeof value === 'string' && value.trim() === '')

export const trimTrailingEmptyCells = (row: string[]): string[] => {
  let lastNonNullIndex = 0
  for (let i = 0; i < row.length; i++) {
    if (!isNullOrWhitespace(row[i])) {
      lastNonNullIndex = i
    }
  }
  return row.slice(0, lastNonNullIndex + 1)
}

/**
 * Cascades values down the dataset until a blank row, new value, or end of dataset
 * @param rows Array of rows to process
 * @returns Processed rows with cascaded values
 */
export const cascadeRowValues = (rows: any[][]): any[][] => {
  if (!rows || rows.length === 0) return rows

  const result = [...rows]
  const columnCount = Math.max(...rows.map((row) => row.length))

  // For each column
  for (let col = 0; col < columnCount; col++) {
    let lastValue = null

    // For each row
    for (let row = 0; row < result.length; row++) {
      // Skip completely blank/null rows - they reset the cascade
      if (result[row].every(isNullOrWhitespace)) {
        lastValue = null
        continue
      }

      // If current cell is empty and we have a last value, fill it
      if (isNullOrWhitespace(result[row][col]) && lastValue !== null) {
        result[row][col] = lastValue
      }
      // Otherwise, update the last value if the current cell is not empty
      else if (!isNullOrWhitespace(result[row][col])) {
        lastValue = result[row][col]
      }
    }
  }

  return result
}

/**
 * Determines if a row is likely a header row based on heuristics
 * @param row Row to evaluate
 * @returns True if the row is likely a header row
 */
export const isLikelyHeaderRow = (row: any[]): boolean => {
  if (!row || row.length === 0) return false

  // Headers typically don't have many numeric values
  const numericCount = row.filter(
    (cell) =>
      typeof cell === 'number' ||
      (typeof cell === 'string' && !isNaN(Number(cell)) && cell.trim() !== '')
  ).length

  // Headers typically have more text values
  const textCount = row.filter(
    (cell) =>
      typeof cell === 'string' && cell.trim() !== '' && isNaN(Number(cell))
  ).length

  // If more than 80% of non-empty cells are text, it's likely a header
  const nonEmptyCount = row.filter((cell) => !isNullOrWhitespace(cell)).length

  // Require at least 2 non-empty cells to be considered a header
  if (nonEmptyCount < 2) return false

  // For mixed content rows, be more strict about the text percentage
  return nonEmptyCount > 0 && textCount / nonEmptyCount >= 0.8
}

/**
 * Cascades values across the header rows until a blank column, new value, or end of dataset
 * Only evaluates the first 5 rows maximum
 * @param headerRows Array of potential header rows to process
 * @returns Processed header rows with cascaded values
 */
export const cascadeHeaderValues = (headerRows: any[][]): any[][] => {
  if (!headerRows || headerRows.length === 0) return headerRows

  // Only process up to 5 rows maximum
  const rowsToProcess = headerRows.slice(0, 5)
  const result = [...rowsToProcess]

  // Filter to only include rows that are likely headers
  const likelyHeaderRows = rowsToProcess.filter(isLikelyHeaderRow)

  // If no likely header rows, return original rows
  if (likelyHeaderRows.length === 0) return rowsToProcess

  // For each likely header row
  for (let rowIndex = 0; rowIndex < likelyHeaderRows.length; rowIndex++) {
    let lastValue = null
    const row = likelyHeaderRows[rowIndex]

    // For each column in the row
    for (let col = 0; col < row.length; col++) {
      // If current cell is empty and we have a last value, fill it
      if (isNullOrWhitespace(row[col]) && lastValue !== null) {
        // Find the corresponding row in the result
        const resultRowIndex = rowsToProcess.findIndex((r) => r === row)
        if (resultRowIndex >= 0) {
          result[resultRowIndex][col] = lastValue
        }
      }
      // Otherwise, update the last value if the current cell is not empty
      else if (!isNullOrWhitespace(row[col])) {
        lastValue = row[col]
      }
      // If we encounter a completely blank/null column, reset the cascade
      const isColumnEmpty = rowsToProcess.every(
        (r) => col >= r.length || isNullOrWhitespace(r[col])
      )
      if (isColumnEmpty) {
        lastValue = null
      }
    }
  }

  return result
}
