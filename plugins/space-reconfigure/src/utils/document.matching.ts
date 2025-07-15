import type { Flatfile } from '@flatfile/api'

export interface DocumentMatch {
  existingDocument: Flatfile.Document
  configIndex: number
}

/**
 * Matches document configurations to existing documents in a space
 * @param existingDocuments - Array of existing documents in the space
 * @param documentConfigs - Array of document configurations to match
 * @returns Object containing matches, unmatched configs, and documents to delete
 */
export function matchDocuments(
  existingDocuments: Flatfile.Document[],
  documentConfigs: Flatfile.DocumentConfig[]
): {
  matches: DocumentMatch[]
  unmatchedConfigs: { config: Flatfile.DocumentConfig; index: number }[]
  documentsToDelete: Flatfile.Document[]
} {
  const matches: DocumentMatch[] = []
  const unmatchedConfigs: { config: Flatfile.DocumentConfig; index: number }[] =
    []
  const usedDocuments = new Set<string>()

  documentConfigs.forEach((config, configIndex) => {
    // Try to match by title first
    let matchedDocument = existingDocuments.find(
      (doc) => doc.title === config.title && !usedDocuments.has(doc.id)
    )

    if (matchedDocument) {
      matches.push({
        existingDocument: matchedDocument,
        configIndex,
      })
      usedDocuments.add(matchedDocument.id)
    } else {
      unmatchedConfigs.push({ config, index: configIndex })
    }
  })

  // Any existing documents that weren't matched should be deleted
  const documentsToDelete = existingDocuments.filter(
    (doc) => !usedDocuments.has(doc.id)
  )

  return { matches, unmatchedConfigs, documentsToDelete }
}
