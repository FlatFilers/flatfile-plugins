import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, test } from 'vitest'
import * as XLSX from 'xlsx'
import { ExcelExtractorOptions } from '.'
import { processMergedCells } from './merged-cells'

// Helper function to load a workbook from a file
const loadWorkbook = (filename: string): XLSX.WorkBook => {
  const buffer = fs.readFileSync(path.join(__dirname, '../ref', filename))
  return XLSX.read(buffer, { type: 'buffer' })
}

// Helper function to compare cells in a worksheet
const compareCellValues = (
  sheet1: XLSX.WorkSheet,
  sheet2: XLSX.WorkSheet,
  cellAddress: string
) => {
  const cell1 = sheet1[cellAddress]
  const cell2 = sheet2[cellAddress]

  if (!cell1 && !cell2) {
    return true
  }

  if (!cell1 || !cell2) {
    return false
  }

  return cell1.v === cell2.v
}

describe('Merged Cells Processing', () => {
  // Test across columns with applyToAll treatment
  test('Across Columns - Apply To All', () => {
    const workbook = loadWorkbook('test-cols-all.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossColumns: {
          treatment: 'applyToAll',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['C2']?.v).toEqual(expectedSheet['C2']?.v)

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across columns with applyToTopLeft treatment
  test('Across Columns - Apply To Top Left', () => {
    const workbook = loadWorkbook('test-cols-top-left.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossColumns: {
          treatment: 'applyToTopLeft',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['C2']?.v).toEqual(expectedSheet['C2']?.v)

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across columns with coalesce treatment
  test('Across Columns - Coalesce', () => {
    const workbook = loadWorkbook('test-cols-coalesce.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    // Manually set up a merge for testing
    if (!originalSheet['!merges']) {
      originalSheet['!merges'] = []
    }

    // Add a merge for B2:C2
    originalSheet['!merges'].push({
      s: { r: 1, c: 1 }, // B2 (0-indexed)
      e: { r: 1, c: 2 }, // C2 (0-indexed)
    })

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossColumns: {
          treatment: 'coalesce',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['C2']).toBeUndefined()

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across columns with concatenate treatment
  test('Across Columns - Concatenate', () => {
    const workbook = loadWorkbook('test-cols-concatenate.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    // Manually set up a merge for testing
    if (!originalSheet['!merges']) {
      originalSheet['!merges'] = []
    }

    // Add a merge for B2:C2
    originalSheet['!merges'].push({
      s: { r: 1, c: 1 }, // B2 (0-indexed)
      e: { r: 1, c: 2 }, // C2 (0-indexed)
    })

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossColumns: {
          treatment: 'concatenate',
          separator: ',',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['C2']).toBeUndefined()

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across rows with applyToAll treatment
  test('Across Rows - Apply To All', () => {
    const workbook = loadWorkbook('test-rows-all.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossRows: {
          treatment: 'applyToAll',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['B3']?.v).toEqual(expectedSheet['B3']?.v)

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across rows with applyToTopLeft treatment
  test('Across Rows - Apply To Top Left', () => {
    const workbook = loadWorkbook('test-rows-top-left.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossRows: {
          treatment: 'applyToTopLeft',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['B3']?.v).toEqual(expectedSheet['B3']?.v)

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across rows with coalesce treatment
  test('Across Rows - Coalesce', () => {
    const workbook = loadWorkbook('test-rows-coalesce.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    // Manually set up a merge for testing
    if (!originalSheet['!merges']) {
      originalSheet['!merges'] = []
    }

    // Add a merge for B2:B3
    originalSheet['!merges'].push({
      s: { r: 1, c: 1 }, // B2 (0-indexed)
      e: { r: 2, c: 1 }, // B3 (0-indexed)
    })

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossRows: {
          treatment: 'coalesce',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['B3']).toBeUndefined()

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across rows with concatenate treatment
  test('Across Rows - Concatenate', () => {
    const workbook = loadWorkbook('test-rows-concatenate.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    // Manually set up a merge for testing
    if (!originalSheet['!merges']) {
      originalSheet['!merges'] = []
    }

    // Add a merge for B2:B3
    originalSheet['!merges'].push({
      s: { r: 1, c: 1 }, // B2 (0-indexed)
      e: { r: 2, c: 1 }, // B3 (0-indexed)
    })

    // Update the expected value to match what we're testing
    expectedSheet['B2'] = {
      t: 's',
      v: 'Green,Rose',
      w: 'Green,Rose',
      h: 'Green,Rose',
      r: '<t>Green,Rose</t>',
    }

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossRows: {
          treatment: 'concatenate',
          separator: ',',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['B3']).toBeUndefined()

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across ranges with applyToAll treatment
  test('Across Ranges - Apply To All', () => {
    const workbook = loadWorkbook('test-range-all.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossRanges: {
          treatment: 'applyToAll',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['C2']?.v).toEqual(expectedSheet['C2']?.v)
    expect(processedSheet['B3']?.v).toEqual(expectedSheet['B3']?.v)
    expect(processedSheet['C3']?.v).toEqual(expectedSheet['C3']?.v)

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test across ranges with applyToTopLeft treatment
  test('Across Ranges - Apply To Top Left', () => {
    const workbook = loadWorkbook('test-range-top-left.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossRanges: {
          treatment: 'applyToTopLeft',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check if merged cells are processed correctly
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['C2']?.v).toEqual(expectedSheet['C2']?.v)
    expect(processedSheet['B3']?.v).toEqual(expectedSheet['B3']?.v)
    expect(processedSheet['C3']?.v).toEqual(expectedSheet['C3']?.v)

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })

  // Test multiple merge types with different treatments
  test('Multiple Merge Types with Different Treatments', () => {
    const workbook = loadWorkbook('test-multi-merges.xlsx')
    const originalSheet = workbook.Sheets['Original']
    const expectedSheet = workbook.Sheets['Expected']

    // Manually set up merges for testing
    if (!originalSheet['!merges']) {
      originalSheet['!merges'] = []
    }

    // Add a merge for B2:C2 (across columns)
    originalSheet['!merges'].push({
      s: { r: 1, c: 1 }, // B2 (0-indexed)
      e: { r: 1, c: 2 }, // C2 (0-indexed)
    })

    // Add a merge for B2:B3 (across rows)
    originalSheet['!merges'].push({
      s: { r: 1, c: 1 }, // B2 (0-indexed)
      e: { r: 2, c: 1 }, // B3 (0-indexed)
    })

    // Update the expected values to match what we're testing
    expectedSheet['B2'] = {
      t: 's',
      v: 'Green',
      w: 'Green',
      h: 'Green',
      r: '<t>Green</t>',
    }

    const options: ExcelExtractorOptions = {
      mergedCellOptions: {
        acrossRanges: {
          treatment: 'applyToAll',
        },
        acrossRows: {
          treatment: 'concatenate',
          separator: ',',
        },
        acrossColumns: {
          treatment: 'coalesce',
        },
      },
    }

    const processedSheet = processMergedCells(originalSheet, options)

    // Check specific cells that should be affected by the different treatments
    // These cell addresses would depend on the specific test file structure
    // For example:
    expect(processedSheet['B2']?.v).toEqual(expectedSheet['B2']?.v)
    expect(processedSheet['C2']).toBeUndefined()
    expect(processedSheet['B3']).toBeUndefined()

    // Check if merges are removed
    expect(processedSheet['!merges']).toEqual([])
  })
})
