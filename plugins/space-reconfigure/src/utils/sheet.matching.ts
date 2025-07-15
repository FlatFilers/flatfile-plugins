import type { Flatfile } from '@flatfile/api'

export interface SheetMatch {
  existingSheet: Flatfile.Sheet
  configIndex: number
}

/**
 * Matches sheet configurations to existing sheets in a workbook
 * @param existingSheets - Array of existing sheets in the workbook
 * @param sheetConfigs - Array of sheet configurations to match
 * @returns Object containing matches, unmatched configs, and sheets to delete
 */
export function matchSheets(
  existingSheets: Flatfile.Sheet[],
  sheetConfigs: Flatfile.SheetConfig[]
): {
  matches: SheetMatch[]
  unmatchedConfigs: { config: Flatfile.SheetConfig; index: number }[]
  sheetsToDelete: Flatfile.Sheet[]
} {
  const matches: SheetMatch[] = []
  const unmatchedConfigs: { config: Flatfile.SheetConfig; index: number }[] = []
  const usedSheets = new Set<string>()

  sheetConfigs.forEach((config, configIndex) => {
    // Try to match by name first
    let matchedSheet = existingSheets.find(
      sheet => sheet.name === config.name && !usedSheets.has(sheet.id)
    )

    // If no name match, try to match by slug if available
    if (!matchedSheet && config.slug) {
      matchedSheet = existingSheets.find(
        sheet => sheet.slug === config.slug && !usedSheets.has(sheet.id)
      )
    }

    if (matchedSheet) {
      matches.push({
        existingSheet: matchedSheet,
        configIndex
      })
      usedSheets.add(matchedSheet.id)
    } else {
      unmatchedConfigs.push({ config, index: configIndex })
    }
  })

  // Any existing sheets that weren't matched should be deleted
  const sheetsToDelete = existingSheets.filter(sheet => !usedSheets.has(sheet.id))

  return { matches, unmatchedConfigs, sheetsToDelete }
}
