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
