import * as XLSX from 'xlsx'
import { ExcelExtractorOptions } from '.'

/**
 * Represents a merged cell range
 */
interface MergedCellRange {
  s: { r: number; c: number } // start row and column
  e: { r: number; c: number } // end row and column
}

/**
 * Categorizes a merged cell range as across columns, across rows, or across a range
 * @param merge The merged cell range to categorize
 * @returns The category of the merged cell range
 */
function categorizeMergedCell(
  merge: MergedCellRange
): 'acrossColumns' | 'acrossRows' | 'acrossRanges' {
  const isSingleRow = merge.s.r === merge.e.r
  const isSingleColumn = merge.s.c === merge.e.c

  if (isSingleRow && !isSingleColumn) {
    return 'acrossColumns'
  } else if (!isSingleRow && isSingleColumn) {
    return 'acrossRows'
  } else {
    return 'acrossRanges'
  }
}

/**
 * Processes merged cells in a worksheet according to the specified options
 * @param sheet The worksheet to process
 * @param options The options for handling merged cells
 * @returns The processed worksheet
 */
export function processMergedCells(
  sheet: XLSX.WorkSheet,
  options?: ExcelExtractorOptions
): XLSX.WorkSheet {
  if (!sheet['!merges'] || !options?.mergedCellOptions) {
    return sheet
  }

  // Create a deep copy of the sheet to avoid modifying the original
  const processedSheet = JSON.parse(JSON.stringify(sheet)) as XLSX.WorkSheet
  const merges = [...(sheet['!merges'] || [])] as MergedCellRange[]

  // First, process 'applyToAll' and 'applyToTopLeft' treatments for all vectors
  processTreatments(processedSheet, merges, options, [
    'applyToAll',
    'applyToTopLeft',
  ])

  // Then, process 'concatenate' treatments
  processTreatments(processedSheet, merges, options, ['concatenate'])

  // Finally, process 'coalesce' treatments
  processTreatments(processedSheet, merges, options, ['coalesce'])

  // Remove the merges that have been processed
  processedSheet['!merges'] = []

  return processedSheet
}

/**
 * Processes merged cells with the specified treatments
 * @param sheet The worksheet to process
 * @param merges The merged cell ranges to process
 * @param options The options for handling merged cells
 * @param treatments The treatments to process
 */
function processTreatments(
  sheet: XLSX.WorkSheet,
  merges: MergedCellRange[],
  options: ExcelExtractorOptions,
  treatments: ('applyToAll' | 'applyToTopLeft' | 'coalesce' | 'concatenate')[]
): void {
  // Process across ranges first
  processVectorTreatments(sheet, merges, options, 'acrossRanges', treatments)

  // Then process across rows
  processVectorTreatments(sheet, merges, options, 'acrossRows', treatments)

  // Finally process across columns
  processVectorTreatments(sheet, merges, options, 'acrossColumns', treatments)
}

/**
 * Processes merged cells for a specific vector with the specified treatments
 * @param sheet The worksheet to process
 * @param merges The merged cell ranges to process
 * @param options The options for handling merged cells
 * @param vector The vector to process
 * @param treatments The treatments to process
 */
function processVectorTreatments(
  sheet: XLSX.WorkSheet,
  merges: MergedCellRange[],
  options: ExcelExtractorOptions,
  vector: 'acrossColumns' | 'acrossRows' | 'acrossRanges',
  treatments: ('applyToAll' | 'applyToTopLeft' | 'coalesce' | 'concatenate')[]
): void {
  const vectorOptions = options.mergedCellOptions?.[vector]
  if (!vectorOptions || !treatments.includes(vectorOptions.treatment)) {
    return
  }

  // Filter merges by vector
  const vectorMerges = merges.filter(
    (merge) => categorizeMergedCell(merge) === vector
  )

  for (const merge of vectorMerges) {
    const treatment = vectorOptions.treatment

    // Get the cell address of the top-left cell in the merge
    const topLeftCellAddress = XLSX.utils.encode_cell({
      r: merge.s.r,
      c: merge.s.c,
    })
    const topLeftCell = sheet[topLeftCellAddress]

    if (!topLeftCell) {
      continue
    }

    // Apply the treatment based on the vector and treatment type
    if (treatment === 'applyToAll') {
      applyToAllCells(sheet, merge, topLeftCell)
    } else if (treatment === 'applyToTopLeft') {
      applyToTopLeftCell(sheet, merge)
    } else if (
      treatment === 'coalesce' &&
      (vector === 'acrossRows' || vector === 'acrossColumns')
    ) {
      coalesceCells(sheet, merge, vector)
    } else if (
      treatment === 'concatenate' &&
      (vector === 'acrossRows' || vector === 'acrossColumns')
    ) {
      concatenateCells(sheet, merge, vector, vectorOptions.separator || ',')
    }
  }
}

/**
 * Applies the value of the top-left cell to all cells in the merged range
 * @param sheet The worksheet to process
 * @param merge The merged cell range to process
 * @param topLeftCell The top-left cell in the merged range
 */
function applyToAllCells(
  sheet: XLSX.WorkSheet,
  merge: MergedCellRange,
  topLeftCell: XLSX.CellObject
): void {
  for (let r = merge.s.r; r <= merge.e.r; r++) {
    for (let c = merge.s.c; c <= merge.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c })
      sheet[cellAddress] = { ...topLeftCell }
    }
  }
}

/**
 * Applies the value of the top-left cell to only the top-left cell in the merged range
 * and clears all other cells in the range
 * @param sheet The worksheet to process
 * @param merge The merged cell range to process
 */
function applyToTopLeftCell(
  sheet: XLSX.WorkSheet,
  merge: MergedCellRange
): void {
  for (let r = merge.s.r; r <= merge.e.r; r++) {
    for (let c = merge.s.c; c <= merge.e.c; c++) {
      if (r !== merge.s.r || c !== merge.s.c) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        sheet[cellAddress] = { t: 's', v: '' }
      }
    }
  }
}

/**
 * Coalesces cells in the merged range
 * @param sheet The worksheet to process
 * @param merge The merged cell range to process
 * @param vector The vector to process
 */
function coalesceCells(
  sheet: XLSX.WorkSheet,
  merge: MergedCellRange,
  vector: 'acrossRows' | 'acrossColumns'
): void {
  if (vector === 'acrossRows') {
    // Keep only the first row and remove all other rows
    for (let r = merge.s.r + 1; r <= merge.e.r; r++) {
      for (let c = merge.s.c; c <= merge.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        delete sheet[cellAddress]
      }
    }
  } else if (vector === 'acrossColumns') {
    // Keep only the first column and remove all other columns
    for (let r = merge.s.r; r <= merge.e.r; r++) {
      for (let c = merge.s.c + 1; c <= merge.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        delete sheet[cellAddress]
      }
    }
  }
}

/**
 * Concatenates cells in the merged range
 * @param sheet The worksheet to process
 * @param merge The merged cell range to process
 * @param vector The vector to process
 * @param separator The separator to use for concatenation
 */
function concatenateCells(
  sheet: XLSX.WorkSheet,
  merge: MergedCellRange,
  vector: 'acrossRows' | 'acrossColumns',
  separator: string
): void {
  if (vector === 'acrossRows') {
    // For each column in the merge
    for (let c = merge.s.c; c <= merge.e.c; c++) {
      const values: string[] = []

      // Collect non-empty values from all rows in this column
      for (let r = merge.s.r; r <= merge.e.r; r++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        const cell = sheet[cellAddress]

        if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
          values.push(String(cell.v))
        }
      }

      // Set the concatenated value to the first row and clear other rows
      if (values.length > 0) {
        const firstCellAddress = XLSX.utils.encode_cell({ r: merge.s.r, c })
        sheet[firstCellAddress] = {
          t: 's',
          v: values.join(separator),
          w: values.join(separator),
          h: values.join(separator),
          r: `<t>${values.join(separator)}</t>`,
        }

        // Clear other rows
        for (let r = merge.s.r + 1; r <= merge.e.r; r++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c })
          delete sheet[cellAddress]
        }
      }
    }
  } else if (vector === 'acrossColumns') {
    // For each row in the merge
    for (let r = merge.s.r; r <= merge.e.r; r++) {
      const values: string[] = []

      // Collect non-empty values from all columns in this row
      for (let c = merge.s.c; c <= merge.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c })
        const cell = sheet[cellAddress]

        if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
          values.push(String(cell.v))
        }
      }

      // Set the concatenated value to the first column and clear other columns
      if (values.length > 0) {
        const firstCellAddress = XLSX.utils.encode_cell({ r, c: merge.s.c })
        sheet[firstCellAddress] = {
          t: 's',
          v: values.join(separator),
          w: values.join(separator),
          h: values.join(separator),
          r: `<t>${values.join(separator)}</t>`,
        }

        // Clear other columns
        for (let c = merge.s.c + 1; c <= merge.e.c; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c })
          delete sheet[cellAddress]
        }
      }
    }
  }
}
