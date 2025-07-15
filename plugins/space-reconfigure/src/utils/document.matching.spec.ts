import { describe, expect, it } from 'vitest'
import { matchDocuments } from './document.matching'
import type { Flatfile } from '@flatfile/api'

describe('document matching utility', () => {
  const mockExistingDocuments: Flatfile.Document[] = [
    {
      id: 'doc-1',
      title: 'Welcome Guide',
      body: '<h1>Welcome to our platform</h1>',
      spaceId: 'space-1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 'doc-2',
      title: 'API Documentation',
      body: '<h1>API Reference</h1>',
      spaceId: 'space-1',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ] as Flatfile.Document[]

  const mockDocumentConfigs: Flatfile.DocumentConfig[] = [
    {
      title: 'Welcome Guide',
      body: '<h1>Welcome to our updated platform</h1>',
    },
    {
      title: 'API Documentation',
      body: '<h1>API Reference - Updated</h1>',
    },
  ]

  it('should match documents by title', () => {
    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      mockExistingDocuments,
      mockDocumentConfigs
    )

    expect(matches).toHaveLength(2)
    expect(unmatchedConfigs).toHaveLength(0)
    expect(documentsToDelete).toHaveLength(0)

    expect(matches[0].existingDocument.title).toBe('Welcome Guide')
    expect(matches[0].configIndex).toBe(0)
    expect(matches[1].existingDocument.title).toBe('API Documentation')
    expect(matches[1].configIndex).toBe(1)
  })

  it('should handle unmatched document configurations', () => {
    const documentConfigs = [
      {
        title: 'Welcome Guide',
        body: '<h1>Welcome</h1>',
      },
      {
        title: 'New User Manual',
        body: '<h1>User Manual</h1>',
      },
    ]

    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      mockExistingDocuments,
      documentConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(documentsToDelete).toHaveLength(1) // API Documentation should be deleted

    expect(matches[0].existingDocument.title).toBe('Welcome Guide')
    expect(unmatchedConfigs[0].config.title).toBe('New User Manual')
    expect(unmatchedConfigs[0].index).toBe(1)
    expect(documentsToDelete[0].title).toBe('API Documentation')
  })

  it('should handle empty document configurations', () => {
    const documentConfigs: Flatfile.DocumentConfig[] = []

    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      mockExistingDocuments,
      documentConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(0)
    expect(documentsToDelete).toHaveLength(2) // All existing documents should be deleted
  })

  it('should handle empty existing documents', () => {
    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      [],
      mockDocumentConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(2)
    expect(documentsToDelete).toHaveLength(0)
    expect(unmatchedConfigs[0].config.title).toBe('Welcome Guide')
    expect(unmatchedConfigs[1].config.title).toBe('API Documentation')
  })

  it('should not match the same document twice', () => {
    const documentConfigs = [
      {
        title: 'Welcome Guide',
        body: '<h1>First version</h1>',
      },
      {
        title: 'Welcome Guide', // Same title, should not match
        body: '<h1>Second version</h1>',
      },
    ]

    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      mockExistingDocuments,
      documentConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(documentsToDelete).toHaveLength(1) // API Documentation should be deleted

    expect(matches[0].existingDocument.title).toBe('Welcome Guide')
    expect(matches[0].configIndex).toBe(0)
    expect(unmatchedConfigs[0].config.title).toBe('Welcome Guide')
    expect(unmatchedConfigs[0].index).toBe(1)
    expect(documentsToDelete[0].title).toBe('API Documentation')
  })

  it('should handle documents without titles', () => {
    const documentConfigs = [
      {
        body: '<h1>No title document</h1>',
      } as Flatfile.DocumentConfig, // No title field
      {
        title: 'Welcome Guide',
        body: '<h1>Has title</h1>',
      },
    ]

    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      mockExistingDocuments,
      documentConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(documentsToDelete).toHaveLength(1) // API Documentation should be deleted

    expect(matches[0].existingDocument.title).toBe('Welcome Guide')
    expect(matches[0].configIndex).toBe(1)
    expect(unmatchedConfigs[0].config.body).toBe('<h1>No title document</h1>')
    expect(unmatchedConfigs[0].index).toBe(0)
    expect(documentsToDelete[0].title).toBe('API Documentation')
  })

  it('should identify documents to delete when no configurations match', () => {
    const documentConfigs = [
      {
        title: 'Completely Different Document',
        body: '<h1>Different content</h1>',
      },
    ]

    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      mockExistingDocuments,
      documentConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(documentsToDelete).toHaveLength(2) // Both existing documents should be deleted

    expect(unmatchedConfigs[0].config.title).toBe('Completely Different Document')
    expect(documentsToDelete.map(d => d.title)).toContain('Welcome Guide')
    expect(documentsToDelete.map(d => d.title)).toContain('API Documentation')
  })

  it('should handle case-sensitive title matching', () => {
    const documentConfigs = [
      {
        title: 'welcome guide', // Different case
        body: '<h1>Welcome</h1>',
      },
      {
        title: 'Welcome Guide', // Exact match
        body: '<h1>Welcome</h1>',
      },
    ]

    const { matches, unmatchedConfigs, documentsToDelete } = matchDocuments(
      mockExistingDocuments,
      documentConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(documentsToDelete).toHaveLength(1) // API Documentation should be deleted

    expect(matches[0].existingDocument.title).toBe('Welcome Guide')
    expect(matches[0].configIndex).toBe(1) // Should match the exact case
    expect(unmatchedConfigs[0].config.title).toBe('welcome guide')
    expect(unmatchedConfigs[0].index).toBe(0)
  })
})
