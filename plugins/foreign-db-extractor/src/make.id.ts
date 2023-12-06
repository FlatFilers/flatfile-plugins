import { customAlphabet } from 'nanoid'
import { alphanumeric } from 'nanoid-dictionary'
import { v4 as uuidv4 } from 'uuid'

// Copied from platform
export const MINIMUM_LENGTH = 8
export const DEFAULT_LENGTH = 8
export const MAXIMUM_LENGTH = 64

export function makeId(length?: number) {
  const idLength = getValidLength(length)
  if (idLength === 32) {
    return uuidv4().replace(/-/g, '')
  }
  const nanoid = customAlphabet(alphanumeric, idLength)

  return nanoid(idLength)
}

function getValidLength(providedLength?: number) {
  const defaultLength = process.env.DEFAULT_ID_LENGTH
    ? parseInt(process.env.DEFAULT_ID_LENGTH, 10)
    : DEFAULT_LENGTH
  const length = providedLength ?? defaultLength

  if (length < MINIMUM_LENGTH) {
    throw new Error(`The id length must be >= ${MINIMUM_LENGTH}`)
  }
  if (length > MAXIMUM_LENGTH) {
    throw new Error(`The id length must be <= ${MAXIMUM_LENGTH}`)
  }
  return length
}
