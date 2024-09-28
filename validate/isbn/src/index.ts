import { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { ISBN } from 'isbn3'

interface ISBNValidatorConfig {
  sheetSlug: string
  isbnFields: string[]
  autoConvert: boolean
}

export default function isbnValidator(
  listener: FlatfileListener,
  config: ISBNValidatorConfig
) {
  const { sheetSlug, isbnFields, autoConvert } = config

  listener.use(
    recordHook(sheetSlug, async (record, event) => {
      for (const isbnField of isbnFields) {
        const isbn = record.get(isbnField) as string
        if (isbn) {
          const cleanISBN = isbn.replace(/[-\s]/g, '')
          const isbnObj = new ISBN(cleanISBN)

          if (!isbnObj.isValid()) {
            record.addError(isbnField, 'Invalid ISBN format')
          } else {
            if (cleanISBN.length === 10) {
              const isbn10Regex = /^(?:\d{9}[\dX])$/
              if (!isbn10Regex.test(cleanISBN)) {
                record.addError(isbnField, 'Invalid ISBN-10 format')
              } else {
                const sum = cleanISBN
                  .split('')
                  .slice(0, 9)
                  .reduce((acc, digit, index) => {
                    return acc + parseInt(digit) * (10 - index)
                  }, 0)
                const checkDigit = (11 - (sum % 11)) % 11
                const lastDigit =
                  cleanISBN.charAt(9) === 'X'
                    ? 10
                    : parseInt(cleanISBN.charAt(9))
                if (checkDigit !== lastDigit) {
                  record.addError(isbnField, 'Invalid ISBN-10 check digit')
                } else if (autoConvert) {
                  const isbn13 = isbnObj.to13()
                  record.set(isbnField, isbn13)
                  record.addInfo(isbnField, 'Converted ISBN-10 to ISBN-13')
                }
              }
            } else if (cleanISBN.length === 13) {
              const isbn13Regex = /^\d{13}$/
              if (!isbn13Regex.test(cleanISBN)) {
                record.addError(isbnField, 'Invalid ISBN-13 format')
              } else {
                const sum = cleanISBN
                  .split('')
                  .slice(0, 12)
                  .reduce((acc, digit, index) => {
                    return acc + parseInt(digit) * (index % 2 === 0 ? 1 : 3)
                  }, 0)
                const checkDigit = (10 - (sum % 10)) % 10
                if (checkDigit !== parseInt(cleanISBN.charAt(12))) {
                  record.addError(isbnField, 'Invalid ISBN-13 check digit')
                }
              }
            } else {
              record.addError(isbnField, 'ISBN must be either 10 or 13 digits')
            }
          }
        } else {
          record.addError(isbnField, 'ISBN is required')
        }
      }

      return record
    })
  )
}
