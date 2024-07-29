export function prependNonUniqueHeaderColumns(
  record: Record<string, string>
): Record<string, string> {
  const counts: Record<string, number> = {}
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(record)) {
    const newValue = value ? value : 'empty'
    const cleanValue = newValue.replace('*', '')

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
