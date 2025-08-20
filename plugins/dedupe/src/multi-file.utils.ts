import type { Flatfile } from '@flatfile/api'

export interface RecordWithSource {
  id: string
  values: Record<string, Flatfile.CellValue>
  _source?: {
    sheetId: string
    sheetName: string
    priority: number
  }
}

export function generateMergeKey(
  record: RecordWithSource,
  field: string
): string | undefined {
  const value = record.values[field]?.value
  if (value !== undefined && value !== null) {
    return value.toString()
  }
  return undefined
}

export function mergeRecordsWithPriority(
  records: RecordWithSource[],
  strategy: 'delete' | 'merge' | 'union'
): RecordWithSource {
  const sortedRecords = records.sort(
    (a, b) => (b._source?.priority || 0) - (a._source?.priority || 0)
  )

  if (strategy === 'delete') {
    return sortedRecords[0]
  }

  const baseRecord = { ...sortedRecords[0] }

  if (strategy === 'union') {
    for (let i = 1; i < sortedRecords.length; i++) {
      const record = sortedRecords[i]
      for (const [key, value] of Object.entries(record.values)) {
        if (!baseRecord.values[key] || !baseRecord.values[key]?.value) {
          baseRecord.values[key] = value
        }
      }
    }
  } else if (strategy === 'merge') {
    for (let i = 1; i < sortedRecords.length; i++) {
      const record = sortedRecords[i]
      for (const [key, value] of Object.entries(record.values)) {
        const hasBaseValue =
          baseRecord.values[key]?.value !== undefined &&
          baseRecord.values[key]?.value !== null &&
          baseRecord.values[key]?.value !== ''
        const hasSourceValue =
          value?.value !== undefined &&
          value?.value !== null &&
          value?.value !== ''

        if (!hasBaseValue && hasSourceValue) {
          baseRecord.values[key] = value
        }
      }
    }
  }

  return baseRecord
}
