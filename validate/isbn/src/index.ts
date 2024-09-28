import { recordHook } from '@flatfile/plugin-record-hook'
import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'

interface ISBNPluginConfig {
  sheetSlug: string
  isbnFields: string[]
  autoConvert: boolean
}

export function isbnPlugin(config: ISBNPluginConfig) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(
        config.sheetSlug || '*',
        async (record, event: FlatfileEvent) => {
          if (event.context.sheetSlug !== config.sheetSlug) return record

          for (const field of config.isbnFields) {
            const isbn = record.get(field) as string
            if (isbn) {
              const [isValid, message] = validateIsbn(isbn)
              if (!isValid) {
                record.addError(field, message)
              } else if (config.autoConvert && isValidIsbn10(isbn)) {
                const convertedIsbn = isbn10To13(isbn)
                record.set(field, convertedIsbn)
              }
            }
          }
          return record
        }
      )
    )
  }
}

function validateIsbn(isbn: string): [boolean, string] {
  isbn = isbn.replace(/[-\s]/g, '')
  const isbn10Pattern =
    /^(?:ISBN(?:-10)?:?)?(?=[0-9X]{10}$|(?=(?:[0-9]+[-\s]){3})[-\s0-9X]{13}$)[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9X]$/
  const isbn13Pattern =
    /^(?:ISBN(?:-13)?:?)?(?=[0-9]{13}$|(?=(?:[0-9]+[-\s]){4})[-\s0-9]{17}$)97[89][-\s]?[0-9]{1,5}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9]$/

  if (isbn10Pattern.test(isbn)) {
    return validateIsbn10(isbn)
  } else if (isbn13Pattern.test(isbn)) {
    return validateIsbn13(isbn)
  } else {
    return [false, 'Invalid ISBN format']
  }
}

function validateIsbn10(isbn: string): [boolean, string] {
  if (isbn.length !== 10) {
    return [false, 'ISBN-10 must be 10 characters long']
  }
  const total = isbn
    .split('')
    .slice(0, -1)
    .reduce((acc, digit, index) => {
      return acc + (10 - index) * (digit === 'X' ? 10 : parseInt(digit, 10))
    }, 0)
  const checkDigit = (11 - (total % 11)) % 11
  const lastChar = isbn[9] === 'X' ? 10 : parseInt(isbn[9], 10)
  if (checkDigit !== lastChar) {
    return [false, 'Invalid ISBN-10 check digit']
  }
  return [true, 'Valid ISBN-10']
}

function validateIsbn13(isbn: string): [boolean, string] {
  if (isbn.length !== 13) {
    return [false, 'ISBN-13 must be 13 digits long']
  }
  const total = isbn
    .split('')
    .slice(0, -1)
    .reduce((acc, digit, index) => {
      return (
        acc + (index % 2 === 0 ? parseInt(digit, 10) : 3 * parseInt(digit, 10))
      )
    }, 0)
  const checkDigit = (10 - (total % 10)) % 10
  if (checkDigit !== parseInt(isbn[12], 10)) {
    return [false, 'Invalid ISBN-13 check digit']
  }
  return [true, 'Valid ISBN-13']
}

function isValidIsbn10(isbn: string): boolean {
  return validateIsbn10(isbn)[0]
}

function isbn10To13(isbn: string): string {
  isbn = isbn.replace(/[-\s]/g, '').slice(0, -1)
  const isbn13 = '978' + isbn
  const total = isbn13.split('').reduce((acc, digit, index) => {
    return (
      acc + (index % 2 === 0 ? parseInt(digit, 10) : 3 * parseInt(digit, 10))
    )
  }, 0)
  const checkDigit = (10 - (total % 10)) % 10
  return `${isbn13}${checkDigit}`
}
