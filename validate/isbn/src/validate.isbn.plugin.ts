import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import ISBN from 'isbn3'

interface ValidateISBNConfig {
  sheetSlug?: string
  isbnFields?: string[]
  autoFormat?: boolean
  format?: 'isbn13' | 'isbn13h' | 'isbn10' | 'isbn10h'
}

interface ISBNValidationResult {
  isValid: boolean
  formattedISBN?: string
  convertedISBN?: string
  message?: string
}

export function validateAndFormatISBN(
  isbn: string,
  autoFormat: boolean,
  format?: 'isbn13' | 'isbn13h' | 'isbn10' | 'isbn10h'
): ISBNValidationResult {
  const isbnObj = ISBN.parse(isbn.replace(/[-\s]/g, ''))
  if (!isbnObj?.isValid) {
    return { isValid: false, message: 'Invalid ISBN format' }
  }

  let result: ISBNValidationResult = { isValid: true }

  if (autoFormat) {
    result.formattedISBN = isbnObj.isIsbn10 ? isbnObj.isbn10h : isbnObj.isbn13h
    result.message = `Formatted ISBN-${isbnObj.isIsbn10 ? '10' : '13'}`
  }

  if (format) {
    result.convertedISBN = isbnObj[format]
    result.message = `Converted ISBN-${isbnObj.isIsbn10 ? '13' : '10'}`
  }

  return result
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
          if (!isbn) continue

          const result = validateAndFormatISBN(isbn, autoFormat, format)

          if (!result.isValid) {
            record.addError(field, result.message!)
            continue
          }

          if (result.formattedISBN) {
            record.set(field, result.formattedISBN)
            record.addInfo(field, result.message!)
          }

          if (result.convertedISBN) {
            record.set(field, result.convertedISBN)
            record.addInfo(field, result.message!)
          }
        }

        return record
      })
    )
  }
}

export default validateISBN
