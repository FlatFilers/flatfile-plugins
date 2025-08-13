import type { Flatfile } from '@flatfile/api'

export interface NormalizeSheetConfigOptions {
  output?: 'validate' | 'transform'
}

export interface KeyConflict {
  originalKey: string
  normalizedKey: string
  finalKey: string
  message: string
}

export interface ValidationResult {
  conflicts: KeyConflict[]
  hasConflicts: boolean
}

/**
 * Converts a string (in various formats) to snake_case.
 * - Consecutive uppercase letters remain a single chunk (e.g. "XYZ" => "xyz")
 * - But if there's a lowercase letter followed by uppercase letters ("ValueXYZ"),
 *   we insert a space before the uppercase chunk => "Value XYZ"
 * - Hyphens, underscores, spaces become single spaces.
 * - % -> "percent"; $ -> "dollar"
 * - Fully uppercase words stay as one chunk ("FIRSTNAME" => "firstname").
 * - Also, if the entire string is numeric, return it as a number.
 */
export function normalizeKey(key: string | number): string | number {
  if (key === null || key === undefined) {
    return ''
  }
  // 1) If key is already a number, just return it.
  //    e.g., normalizeKey(42) => 42
  if (typeof key === 'number') {
    return key
  }

  // 2) If it's an empty string, return '' instead of "0"
  if (key.trim() === '') {
    return ''
  }

  // 3) If the entire string is numeric (like "123"), return as a number
  if (!isNaN(Number(key))) {
    return Number(key)
  }

  // We have some special characters to handle
  const specialReplacements: Record<string, string> = {
    '%': 'percent',
    $: 'dollar',
  }

  // 4) For each special char, collapse consecutive runs and then replace
  let result = key
  for (const [char, replacement] of Object.entries(specialReplacements)) {
    // (A) Collapse runs of consecutive `char` into a single instance
    //     e.g. "%%%%" => "%"
    const runsRegex = new RegExp(`\\${char}+`, 'g')
    result = result.replace(runsRegex, char)

    // (B) Replace the single `char` with the textual placeholder
    //     Wrap it with spaces => " percent "
    const singleRegex = new RegExp(`\\${char}`, 'g')
    result = result.replace(singleRegex, ` ${replacement} `)
  }

  // 5) Convert hyphens, underscores, multiple spaces => single space
  result = result.replace(/[\s_-]+/g, ' ')

  // 6) Remove or unify any other non-alphanumeric punctuation
  //    e.g. "!!!!" => ' '
  //    But preserve non-English characters
  //    Updated regex to support all languages and scripts instead of only English
  //    e.g.
  //    1. Chinese: "你好" -> "你好"
  //    2. Japanese: "こんにちは" -> "こんにちは"
  //    3. Kanji: "漢字" -> "漢字"
  //    4. Hindi: "नमस्ते" -> "नमस्ते"
  result = result.replace(/[^\p{L}\p{N}\p{M}\p{Pd}\p{Pc}]+/gu, ' ')

  // 7) Split uppercase sequences from subsequent capital+lower
  //    e.g. "HTTPStatus" => "HTTP Status"
  result = result.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')

  // 8) Split a lower/number followed by run of uppercase letters
  //    e.g. "someValueXYZ" => "some Value XYZ"
  result = result.replace(/([a-z0-9])([A-Z]+)/g, '$1 $2')

  // 9) Convert to lowercase
  result = result.toLowerCase()

  // 10) Trim, then replace any remaining spaces with underscores => snake_case
  result = result.trim().replace(/\s+/g, '_')

  return result
}

/**
 * Normalizes the field keys in a Flatfile SheetConfig using snake_case convention.
 * Creates a new SheetConfig with normalized field keys while preserving all other properties.
 * If normalized keys create duplicates, adds _1, _2, etc. to make them unique.
 * 
 * @param sheetConfig - The Flatfile SheetConfig to normalize
 * @param options - Configuration options for the normalization
 * @param options.output - 'validate' returns conflict info, 'transform' (default) returns normalized SheetConfig
 * @returns Either a normalized SheetConfig (transform mode) or validation results (validate mode)
 */

export function normalizeSheetConfig(
  sheetConfig: Flatfile.SheetConfig, 
  options: NormalizeSheetConfigOptions & { output: 'validate' }
): ValidationResult
export function normalizeSheetConfig(
  sheetConfig: Flatfile.SheetConfig, 
  options?: NormalizeSheetConfigOptions & { output?: 'transform' }
): Flatfile.SheetConfig

export function normalizeSheetConfig(
  sheetConfig: Flatfile.SheetConfig, 
  options: NormalizeSheetConfigOptions = {}
): Flatfile.SheetConfig | ValidationResult {
  const { output = 'transform' } = options
  const usedKeys = new Set<string>()
  const conflicts: KeyConflict[] = []
  
  const normalizedFields = sheetConfig.fields.map((field) => {
    const originalKey = field.key
    const normalizedKey = normalizeKey(field.key) as string
    let finalKey = normalizedKey
    let counter = 1
    
    // Track if this key had conflicts
    const hadConflict = usedKeys.has(finalKey)
    
    // If the normalized key is already used, append _1, _2, etc.
    while (usedKeys.has(finalKey)) {
      finalKey = `${normalizedKey}_${counter}`
      counter++
    }
    
    usedKeys.add(finalKey)
    
    // Record conflicts for validation mode
    if (hadConflict || originalKey !== normalizedKey) {
      let message = ''
      if (originalKey !== normalizedKey && hadConflict) {
        message = `Key "${originalKey}" was normalized to "${normalizedKey}" but conflicted with existing key, renamed to "${finalKey}"`
      } else if (hadConflict) {
        message = `Key "${originalKey}" conflicted with existing key, renamed to "${finalKey}"`
      } else if (originalKey !== normalizedKey) {
        message = `Key "${originalKey}" was normalized to "${normalizedKey}"`
      }
      
      if (message) {
        conflicts.push({
          originalKey,
          normalizedKey,
          finalKey,
          message
        })
      }
    }
    
    return {
      ...field,
      key: finalKey,
    }
  })

  if (output === 'validate') {
    return {
      conflicts,
      hasConflicts: conflicts.length > 0
    }
  }

  return {
    ...sheetConfig,
    fields: normalizedFields,
  }
}
