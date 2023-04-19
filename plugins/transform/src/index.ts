import { FlatfileRecord, TPrimitive } from '@flatfile/hooks'

export type FieldTransformation = (
  value: string | number | boolean
) => TPrimitive

export type RecordTransformation = (record: FlatfileRecord) => TPrimitive

export const transform = (
  record: FlatfileRecord,
  fieldName: string,
  transformation: RecordTransformation,
  message?: string
) => {
  record.set(fieldName, transformation(record))
  if (message) {
    record.addComment(fieldName, message)
  }
}

export const compute = (
  record: FlatfileRecord,
  fieldName: string,
  transformation: FieldTransformation,
  message?: string
) => {
  if (typeof record.get(fieldName) === null) return
  const currentValue = record.get(fieldName) as string | number | boolean
  record.set(fieldName, transformation(currentValue))
  if (message) {
    record.addComment(fieldName, message)
  }
}

export const transformIfPresent = (
  record: FlatfileRecord,
  presentFields: [string, ...string[]],
  fieldName: string,
  transformation: RecordTransformation,
  message?: string
) => {
  let allPresent = true
  presentFields.forEach((field) => {
    if (!record.get(field)) {
      allPresent = false
      return
    }
  })
  if (!allPresent) return
  record.set(fieldName, transformation(record))
  if (message) {
    record.addComment(fieldName, message)
  }
}

export const computeIfPresent = transformIfPresent

export const validate = (
  record: FlatfileRecord,
  fieldName: string,
  message: string,
  validator: (record: FlatfileRecord) => boolean
) => {
  if (!validator(record)) {
    record.addError(fieldName, message)
  }
}
