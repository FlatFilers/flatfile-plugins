export function prependNonUniqueHeaderColumns(
  record: Record<string, string>
): Record<string, string> {
  const counts: Record<string, number> = {}
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(record)) {
    const cleanValue = value?.toString().replace('*', '')
    if (cleanValue && counts[value]) {
      result[key] = `${cleanValue}_${counts[value]}`
      counts[value]++
    } else {
      result[key] = cleanValue
      counts[value] = 1
    }
  }

  return result
}

export const isNullOrWhitespace = (value: any) =>
  value === null || (typeof value === 'string' && value.trim() === '')
