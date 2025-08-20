import { Flatfile } from '@flatfile/api'

export interface RecordWithSource {
  id: string
  values: Record<string, Flatfile.CellValue>
  metadata?: Record<string, any>
  _source?: {
    sheetId: string
    sheetName: string
    priority: number
  }
}

export function generateMergeKey(
  record: RecordWithSource,
  on: string | string[]
): string | null {
  if (Array.isArray(on)) {
    const keyParts = on.map((field) => {
      const value = record.values[field]?.value
      return value === null || value === undefined || value === ''
        ? ''
        : String(value).trim()
    })

    if (keyParts.every((part) => part === '')) {
      return null
    }

    return keyParts.join('|')
  } else {
    const value = record.values[on]?.value
    return value === null || value === undefined || value === ''
      ? null
      : String(value).trim()
  }
}

export function generateFilePriority(
  sheetName: string,
  filePriorities: Record<string, number>,
  filePatternPriorities: Array<{ pattern: RegExp | string; priority: number }>
): number {
  if (filePriorities[sheetName] !== undefined) {
    return filePriorities[sheetName]
  }

  for (const { pattern, priority } of filePatternPriorities) {
    if (typeof pattern === 'string') {
      if (sheetName.toLowerCase().includes(pattern.toLowerCase())) {
        return priority
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(sheetName)) {
        return priority
      }
    }
  }

  return 0
}

export function mergeRecordsWithPriority(
  records: RecordWithSource[],
  strategy: 'delete' | 'merge' | 'union'
): RecordWithSource {
  if (records.length === 0) {
    throw new Error('Cannot merge empty record array')
  }

  if (records.length === 1) {
    return records[0]
  }

  const sortedRecords = [...records].sort(
    (a, b) => (b._source?.priority || 0) - (a._source?.priority || 0)
  )

  const baseRecord = { ...sortedRecords[0] }

  if (strategy === 'delete') {
    return baseRecord
  }

  if (strategy === 'merge') {
    for (const field in baseRecord.values) {
      let bestValue = baseRecord.values[field]?.value

      if (bestValue === null || bestValue === undefined || bestValue === '') {
        for (const record of sortedRecords.slice(1)) {
          const value = record.values[field]?.value
          if (value !== null && value !== undefined && value !== '') {
            bestValue = value
            break
          }
        }
      }

      if (bestValue !== null && bestValue !== undefined) {
        baseRecord.values[field] = { value: bestValue }
      }
    }

    return baseRecord
  }

  if (strategy === 'union') {
    const unionValues: Record<string, Set<string>> = {}

    for (const record of sortedRecords) {
      for (const field in record.values) {
        if (!unionValues[field]) {
          unionValues[field] = new Set()
        }

        const value = record.values[field]?.value
        if (value !== null && value !== undefined && value !== '') {
          const stringValue = String(value)
          const parts = stringValue.includes(',')
            ? stringValue.split(',').map((v) => v.trim())
            : [stringValue]
          parts.forEach((part) => {
            if (part) {
              unionValues[field].add(part)
            }
          })
        }
      }
    }

    for (const field in unionValues) {
      const uniqueValues = Array.from(unionValues[field])
      if (uniqueValues.length > 0) {
        baseRecord.values[field] = {
          value:
            uniqueValues.length === 1
              ? uniqueValues[0]
              : uniqueValues.join('; '),
        }
      }
    }

    return baseRecord
  }

  return baseRecord
}

export interface ConditionalMatchingRule {
  /** Primary field that must match exactly */
  primaryField: string
  /** Secondary field that must either match or be blank in one record */
  secondaryField?: string
  /** Whether this rule requires both fields to be populated */
  requireBothPopulated?: boolean
}

export interface ConditionalMatchingConfig {
  /** List of matching rules - if any rule matches, records are considered duplicates */
  rules: ConditionalMatchingRule[]
  /** Custom field value extractor function */
  getValue?: (record: RecordWithSource, field: string) => string | null
}

export function createConditionalMatcher(
  config: ConditionalMatchingConfig
): (record1: RecordWithSource, record2: RecordWithSource) => boolean {
  const defaultGetValue = (record: RecordWithSource, field: string) => {
    const value = record.values[field]?.value
    return value === null || value === undefined || value === ''
      ? null
      : String(value).trim()
  }

  const getValue = config.getValue || defaultGetValue

  return (record1: RecordWithSource, record2: RecordWithSource): boolean => {
    for (const rule of config.rules) {
      const primary1 = getValue(record1, rule.primaryField)
      const primary2 = getValue(record2, rule.primaryField)

      if (!primary1 || !primary2 || primary1 !== primary2) {
        continue
      }

      if (!rule.secondaryField) {
        return true
      }

      const secondary1 = getValue(record1, rule.secondaryField)
      const secondary2 = getValue(record2, rule.secondaryField)

      if (rule.requireBothPopulated) {
        if (secondary1 && secondary2 && secondary1 === secondary2) {
          return true
        }
      } else {
        if (!secondary1 || !secondary2 || secondary1 === secondary2) {
          return true
        }
      }
    }

    return false
  }
}

export interface PriorityMergeConfig {
  /** Fields that should be merged with priority-based selection */
  priorityFields?: string[]
  /** Fields that should be merged by combining all unique values */
  unionFields?: string[]
  /** Custom field value extractor function */
  getValue?: (record: RecordWithSource, field: string) => any
  /** Custom field value setter function */
  setValue?: (record: RecordWithSource, field: string, value: any) => void
}

export function createPriorityMerger(
  config: PriorityMergeConfig = {}
): (records: RecordWithSource[]) => RecordWithSource {
  const defaultGetValue = (record: RecordWithSource, field: string) =>
    record.values[field]?.value
  const defaultSetValue = (
    record: RecordWithSource,
    field: string,
    value: any
  ) => {
    record.values[field] = { value }
  }

  const getValue = config.getValue || defaultGetValue
  const setValue = config.setValue || defaultSetValue
  const priorityFields = config.priorityFields || []
  const unionFields = config.unionFields || []

  return (records: RecordWithSource[]): RecordWithSource => {
    if (records.length === 0) {
      throw new Error('Cannot merge empty record array')
    }

    if (records.length === 1) {
      return records[0]
    }

    const sortedRecords = [...records].sort(
      (a, b) => (b._source?.priority || 0) - (a._source?.priority || 0)
    )

    const mergedRecord = { ...sortedRecords[0] }

    for (const field of priorityFields) {
      let bestValue = null

      for (const record of sortedRecords) {
        const value = getValue(record, field)
        if (value !== null && value !== undefined && value !== '') {
          bestValue = value
          break
        }
      }

      if (bestValue !== null) {
        setValue(mergedRecord, field, bestValue)
      }
    }

    for (const field of unionFields) {
      const uniqueValues = new Set<string>()

      for (const record of sortedRecords) {
        const value = getValue(record, field)
        if (value !== null && value !== undefined && value !== '') {
          const stringValue = String(value)
          const parts = stringValue.includes(',')
            ? stringValue.split(',').map((v) => v.trim())
            : [stringValue]
          parts.forEach((part) => {
            if (part) {
              uniqueValues.add(part)
            }
          })
        }
      }

      if (uniqueValues.size > 0) {
        setValue(mergedRecord, field, Array.from(uniqueValues).join('; '))
      }
    }

    return mergedRecord
  }
}

export interface ProviderTrustConfig {
  externalIdField: string
  npiField: string
  ssnField: string
  coreFields: string[]
}

export function createProviderTrustMatcher(
  config: ProviderTrustConfig
): (record1: RecordWithSource, record2: RecordWithSource) => boolean {
  if (!config) {
    throw new Error('ProviderTrust matcher requires a configuration object')
  }

  const { externalIdField, npiField, ssnField } = config

  if (!externalIdField || !npiField || !ssnField) {
    throw new Error(
      'ProviderTrust matcher requires externalIdField, npiField, and ssnField to be specified'
    )
  }

  return createConditionalMatcher({
    rules: [
      { primaryField: externalIdField },
      {
        primaryField: npiField,
        secondaryField: ssnField,
        requireBothPopulated: false,
      },
      {
        primaryField: ssnField,
        secondaryField: npiField,
        requireBothPopulated: false,
      },
    ],
  })
}

export function createProviderTrustMerger(
  config: ProviderTrustConfig
): (records: RecordWithSource[]) => RecordWithSource {
  if (!config) {
    throw new Error('ProviderTrust merger requires a configuration object')
  }

  const { coreFields } = config

  if (!coreFields || coreFields.length === 0) {
    throw new Error('ProviderTrust merger requires coreFields to be specified')
  }

  return createPriorityMerger({
    priorityFields: coreFields,
  })
}
