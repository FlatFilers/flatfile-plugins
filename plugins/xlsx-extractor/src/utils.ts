export function prependNonUniqueHeaderColumns(
  record: Record<string, string>
): Record<string, string> {
  const counts: Record<string, number> = {}
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(record)) {
    const newValue = value || 'empty'
    const cleanValue = normalizeKey(newValue.replace('*', ''))

    if (cleanValue && counts[cleanValue]) {
      result[key] = `${cleanValue}_${counts[cleanValue]}`
      counts[cleanValue]++
    } else {
      result[key] = cleanValue
      counts[cleanValue] = 1
    }
  }

  return result
}

function normalizeKey(key: string): string {
  return key.trim().replace(/%/g, '_PERCENT_').replace(/\$/g, '_DOLLAR_').replace(/[^a-zA-Z0-9]/g, "_")
}