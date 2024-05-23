/**
 * Converts a value to its string representation of a boolean.
 *
 * @param {any} value - The value to be converted to a boolean string.
 * @returns {string} The string representation of the boolean value ('true' or 'false').
 *
 * @example
 * castBoolean(true); // returns 'true'
 * castBoolean(1); // returns 'true'
 * castBoolean(null); // returns 'false'
 * castBoolean(undefined); // returns 'false'
 * castBoolean(''); // returns 'false'
 */
export const castBoolean = (value) => {
  // If the value is truthy, return 'true', otherwise return 'false'
  // Truthy values include: true, non-zero numbers, non-empty strings, objects, arrays
  // Falsy values include: false, 0, null, undefined, NaN, empty string ('')
  return value ? 'true' : 'false'
}
