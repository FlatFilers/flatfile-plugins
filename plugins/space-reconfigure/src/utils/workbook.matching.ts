import type { Flatfile } from '@flatfile/api'

export interface WorkbookMatch {
  existingWorkbook: Flatfile.Workbook
  configIndex: number
}

/**
 * Matches workbook configurations to existing workbooks in a space
 * @param existingWorkbooks - Array of existing workbooks in the space
 * @param workbookConfigs - Array of workbook configurations to match
 * @returns Array of matches and unmatched configs
 */
export function matchWorkbooks(
  existingWorkbooks: Flatfile.Workbook[],
  workbookConfigs: Partial<Flatfile.CreateWorkbookConfig>[]
): {
  matches: WorkbookMatch[]
  unmatchedConfigs: {
    config: Partial<Flatfile.CreateWorkbookConfig>
    index: number
  }[]
  workbooksToDelete: Flatfile.Workbook[]
} {
  const matches: WorkbookMatch[] = []
  const unmatchedConfigs: {
    config: Partial<Flatfile.CreateWorkbookConfig>
    index: number
  }[] = []
  const usedWorkbooks = new Set<string>()

  workbookConfigs.forEach((config, configIndex) => {
    // Try to match by name first
    let matchedWorkbook = existingWorkbooks.find(
      (wb) => wb.name === config.name && !usedWorkbooks.has(wb.id)
    )

    if (matchedWorkbook) {
      matches.push({
        existingWorkbook: matchedWorkbook,
        configIndex,
      })
      usedWorkbooks.add(matchedWorkbook.id)
    } else {
      unmatchedConfigs.push({ config, index: configIndex })
    }
  })

  // Any existing workbooks that weren't matched should be deleted
  const workbooksToDelete = existingWorkbooks.filter(
    (wb) => !usedWorkbooks.has(wb.id)
  )

  return { matches, unmatchedConfigs, workbooksToDelete }
}
