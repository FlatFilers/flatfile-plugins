import { FlatfileRecord } from '@flatfile/hooks'

export const transform = (
  record: FlatfileRecord,
  fieldName: string,
  transformation: (record) => string | number | boolean | null
) => {
  record.set(fieldName, transformation(record))
}

export const transformIfPresent = (
	record: 
)
