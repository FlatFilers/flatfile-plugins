/**
 * Converts a value to its string representation of a boolean.
 *
 * @param value - The value to be converted to a boolean string.
 * @returns The string representation of the boolean value ('true' or 'false').
 */
export const castBoolean = (value) => {
  // If the value is truthy, return 'true', otherwise return 'false'
  return value ? 'true' : 'false'
}
