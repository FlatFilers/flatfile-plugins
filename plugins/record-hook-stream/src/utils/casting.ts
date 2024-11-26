export function asDate(input: any): Date | null {
  const str_value = asString(input)
  if (!str_value) {
    return null
  }

  const date = new Date(str_value)
  // Check if the date is valid
  return isNaN(date.getTime()) ? null : date
}

export function asNumber(input: any): number {
  // Check if the input is already a number
  if (typeof input === 'number') return input

  // Check if the input is a string that can be converted to a number
  if (typeof input === 'string') {
    // Trim leading and trailing whitespaces
    const trimmedInput = input.trim()

    // Check if the trimmed string is a numeric value
    const num = Number(trimmedInput)

    // Check if the result is a valid number and not NaN
    if (!isNaN(num)) {
      return num
    }
  }

  // Return 0 for inputs that cannot be converted to a number
  return 0
}

export function asString(input: any): string {
  // Check if the input is null or undefined
  if (input === null || input === undefined) {
    return ''
  }

  // Check if the input is an object or an array (excluding null, which is technically an object in JS)
  if (typeof input === 'object') {
    // Attempt to convert objects and arrays to a JSON string
    try {
      return JSON.stringify(input)
    } catch (error) {
      // In case of circular references or other JSON.stringify errors, return a fallback string
      return '[object]'
    }
  }

  // For numbers, booleans, and other types, convert directly to string
  return String(input)
}

export function asNullableString(input: any): string | undefined {
  // Check if the input is null or undefined
  if (
    input === null ||
    input === undefined ||
    input === 'undefined' ||
    input === 'null' ||
    input === ''
  ) {
    return undefined
  }

  return asString(input)
}

export function asBool(input: any): boolean {
  // todo: make this way smarter soon
  return !!input
}
