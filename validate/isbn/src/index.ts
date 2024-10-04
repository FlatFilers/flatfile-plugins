import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import ISBN from 'isbn3'

interface ValidateISBNConfig {
  sheetSlug?: string
  isbnFields?: string[]
  autoFormat?: boolean
  format?: 'isbn13' | 'isbn13h' | 'isbn10' | 'isbn10h'
}

export function validateISBN(config: ValidateISBNConfig = {}) {
  const {
    sheetSlug = '**',
    isbnFields = ['isbn'],
    autoFormat = true,
    format,
  } = config

  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(sheetSlug, async (record) => {
        for (const field of isbnFields) {
          const isbn = record.get(field) as string
          if (!isbn) break

          const isbnObj = ISBN.parse(isbn.replace(/[-\s]/g, ''))
          if (!isbnObj?.isValid) {
            record.addError(field, 'Invalid ISBN format')
            continue
          }

          if (autoFormat) {
            const formattedISBN = isbnObj.isIsbn10
              ? isbnObj.isbn10h
              : isbnObj.isbn13h
            record.set(field, formattedISBN)
            record.addInfo(
              field,
              `Formatted ISBN-${isbnObj.isIsbn10 ? '10' : '13'}`
            )
          }

          if (format) {
            record.set(field, isbnObj[format])
            record.addInfo(
              field,
              `Converted ISBN-${isbnObj.isIsbn10 ? '13' : '10'}`
            )
          }
        }

        return record
      })
    )
  }
}

export default validateISBN
