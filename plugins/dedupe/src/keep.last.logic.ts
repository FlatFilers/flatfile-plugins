import { Flatfile } from '@flatfile/api'

/**
 * Keep the last record encountered based on the specified key.
 *
 * @internal
 */
export const keepLast = (
  records: Flatfile.RecordsWithLinks,
  key: string,
  uniques: Set<unknown>
): Array<string> => {
  try {
    const seen = records.reduce((acc, record) => {
      if (record.values[key].value == null) {
        return acc
      }

      const value = String(record.values[key].value)
      uniques.add(value) // Add value to uniques set

      if (acc[value] == null) {
        acc[value] = [record.id]
      } else {
        acc[value].push(record.id)
      }
      return acc
    }, {} as Record<string, Array<string>>)

    return Object.keys(seen).reduce((acc, keyValue) => {
      const ids = seen[keyValue]
      if (ids.length > 1) {
        // Remove all but the last id
        const removeThese = ids.slice(0, -1)
        return [...acc, ...removeThese]
      } else {
        return acc
      }
    }, [] as Array<string>)
  } catch (error) {
    throw new Error('Failed to keep last record')
  }
}
