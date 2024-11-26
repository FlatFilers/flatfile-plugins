export function isNullish<T>(value: T): value is null {
  return (
    value === null ||
    value === '' ||
    value === undefined ||
    value === 'null' ||
    value === 'undefined' ||
    (typeof value === 'number' && isNaN(value))
  )
}

export function isPresent<T>(value: T): value is NonNullable<T> {
  return !isNullish(value)
}
