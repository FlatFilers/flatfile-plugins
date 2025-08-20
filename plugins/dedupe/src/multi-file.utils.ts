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
  field: string | string[]
): string | undefined {
  if (Array.isArray(field)) {
    const keyParts: string[] = []

    for (const f of field) {
      const value = record.values[f]?.value
      if (value === undefined || value === null) {
        keyParts.push('')
      } else {
        keyParts.push(value.toString())
      }
    }

    if (keyParts.length === field.length) {
      return keyParts.join('::')
    }
  } else {
    const value = record.values[field]?.value
    if (value !== undefined && value !== null) {
      return value.toString()
    }
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

export function generateFilePriority(
  sheetName: string,
  filePriorities?: Record<string, number>,
  filePatternPriorities?: Array<{ pattern: RegExp | string; priority: number }>
): number {
  if (filePriorities && filePriorities[sheetName] !== undefined) {
    return filePriorities[sheetName]
  }

  if (filePatternPriorities) {
    for (const { pattern, priority } of filePatternPriorities) {
      if (pattern instanceof RegExp) {
        if (pattern.test(sheetName)) {
          return priority
        }
      } else if (typeof pattern === 'string') {
        if (sheetName.toLowerCase().includes(pattern.toLowerCase())) {
          return priority
        }
      }
    }
  }

  return 0
}

export function checkRecordsMatch(
  record1: RecordWithSource,
  record2: RecordWithSource,
  customMatcher?: (r1: RecordWithSource, r2: RecordWithSource) => boolean
): boolean {
  if (customMatcher) {
    return customMatcher(record1, record2)
  }

  return false
}

export function createProviderTrustMatcher(): (
  r1: RecordWithSource,
  r2: RecordWithSource
) => boolean {
  return (record1: RecordWithSource, record2: RecordWithSource): boolean => {
    const getValue = (record: RecordWithSource, field: string) => {
      const value = record.values[field]?.value
      return value !== undefined && value !== null && value !== ''
        ? value.toString()
        : null
    }

    const externalId1 = getValue(record1, 'external_id')
    const externalId2 = getValue(record2, 'external_id')
    const npi1 = getValue(record1, 'npi')
    const npi2 = getValue(record2, 'npi')
    const ssn1 = getValue(record1, 'ssn')
    const ssn2 = getValue(record2, 'ssn')

    if (externalId1 && externalId2 && externalId1 === externalId2) {
      return true
    }

    if (npi1 && npi2 && npi1 === npi2) {
      if (!ssn1 || !ssn2 || ssn1 === ssn2) {
        return true
      }
    }

    if (ssn1 && ssn2 && ssn1 === ssn2) {
      if (!npi1 || !npi2 || npi1 === npi2) {
        return true
      }
    }

    return false
  }
}

export function createProviderTrustMerger(): (
  records: RecordWithSource[]
) => RecordWithSource {
  return (records: RecordWithSource[]): RecordWithSource => {
    if (records.length === 1) {
      return records[0]
    }

    const sortedRecords = records.sort(
      (a, b) => (b._source?.priority || 0) - (a._source?.priority || 0)
    )
    const baseRecord = { ...sortedRecords[0] }

    const coreFields = [
      'external_id',
      'type',
      'first_name',
      'middle_name',
      'last_name',
      'date_of_birth',
      'ssn',
      'npi',
    ]

    for (const field of coreFields) {
      const baseValue = baseRecord.values[field]?.value
      const hasBaseValue =
        baseValue !== undefined && baseValue !== null && baseValue !== ''

      if (!hasBaseValue) {
        for (const record of sortedRecords.slice(1)) {
          const value = record.values[field]?.value
          if (value !== undefined && value !== null && value !== '') {
            baseRecord.values[field] = record.values[field]
            break
          }
        }
      }
    }

    const nonCoreFields = new Set<string>()
    for (const record of records) {
      for (const field of Object.keys(record.values)) {
        if (!coreFields.includes(field)) {
          nonCoreFields.add(field)
        }
      }
    }

    for (const field of nonCoreFields) {
      const baseValue = baseRecord.values[field]?.value
      const hasBaseValue =
        baseValue !== undefined && baseValue !== null && baseValue !== ''

      if (!hasBaseValue) {
        for (const record of sortedRecords.slice(1)) {
          const value = record.values[field]?.value
          if (value !== undefined && value !== null && value !== '') {
            baseRecord.values[field] = record.values[field]
            break
          }
        }
      }
    }

    return baseRecord
  }
}
