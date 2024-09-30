import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import ISBN from 'isbn3'

interface ValidateISBNConfig {
  sheetSlug?: string
  isbnFields?: string[]
  autoConvert?: boolean
}

export function validateIsbn(config: ValidateISBNConfig = {}) {
  const {
    sheetSlug = '**',
    isbnFields = ['isbn'],
    autoConvert = false,
  } = config

  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(sheetSlug, async (record) => {
        for (const field of isbnFields) {
          const isbn = record.get(field) as string

          if (!isbn) {
            record.addError(field, 'ISBN is required')
            continue
          }

          const cleanISBN = isbn.replace(/[-\s]/g, '')
          const isbnObj = ISBN.parse(cleanISBN)

          if (!isbnObj) {
            record.addError(field, 'Invalid ISBN format')
            continue
          }

          if (!isbnObj.isValid) {
            record.addError(
              field,
              `Invalid ISBN-${isbnObj.isIsbn10 ? '10' : '13'} format`
            )
            continue
          }

          if (autoConvert) {
            const formattedISBN = isbnObj.isIsbn10
              ? isbnObj.isbn10h
              : isbnObj.isbn13h
            record.set(field, formattedISBN)
            record.addInfo(
              field,
              `Formatted ISBN-${isbnObj.isIsbn10 ? '10' : '13'}`
            )
          }
        }

        return record
      })
    )
  }
}

export default validateIsbn
