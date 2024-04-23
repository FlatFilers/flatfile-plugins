import type { Flatfile } from '@flatfile/api'

/**
 * Keep the first record encountered based on the specified key.
 *
 * @internal
 */
export const keepFirst = (
  records: Flatfile.RecordsWithLinks,
  key: string,
  uniques: Set<unknown>
): Array<string> => {
  try {
    return records.reduce((acc, record) => {
      const { value } = record.values[key]

      if (uniques.has(value)) {
        // If the value has been seen, add the record's id to the accumulator
        return [...acc, record.id]
      } else {
        // Otherwise, mark the value as seen and don't add the id to the accumulator
        uniques.add(value)
        return acc
      }
    }, [])
  } catch (error) {
    throw new Error('Failed to keep first record')
  }
}
