import { describe, expect, it } from 'vitest'
import { matchSheets } from './sheet.matching'
import type { Flatfile } from '@flatfile/api'

describe('sheet matching utility', () => {
  const mockExistingSheets: Flatfile.Sheet[] = [
    {
      id: 'sheet-1',
      name: 'Contacts',
      slug: 'contacts',
      config: {
        name: 'Contacts',
        slug: 'contacts',
        fields: [
          { key: 'name', type: 'string', label: 'Name' },
          { key: 'email', type: 'string', label: 'Email' },
        ],
      },
      workbookId: 'wb-1',
      locked: false,
      lockedBy: null,
      countRecords: { total: 0, valid: 0, error: 0, processing: 0 },
    },
    {
      id: 'sheet-2',
      name: 'Companies',
      slug: 'companies',
      config: {
        name: 'Companies',
        slug: 'companies',
        fields: [
          { key: 'name', type: 'string', label: 'Company Name' },
          { key: 'website', type: 'string', label: 'Website' },
        ],
      },
      workbookId: 'wb-1',
      locked: false,
      lockedBy: null,
      countRecords: { total: 0, valid: 0, error: 0, processing: 0 },
    },
  ] as Flatfile.Sheet[]

  const mockSheetConfigs: Flatfile.SheetConfig[] = [
    {
      name: 'Contacts',
      slug: 'contacts',
      fields: [
        { key: 'name', type: 'string', label: 'Name' },
        { key: 'email', type: 'string', label: 'Email' },
        { key: 'phone', type: 'string', label: 'Phone' },
      ],
    },
    {
      name: 'Companies',
      slug: 'companies',
      fields: [
        { key: 'name', type: 'string', label: 'Company Name' },
        { key: 'website', type: 'string', label: 'Website' },
      ],
    },
  ]

  it('should match sheets by name', () => {
    const { matches, unmatchedConfigs, sheetsToDelete } = matchSheets(
      mockExistingSheets,
      mockSheetConfigs
    )

    expect(matches).toHaveLength(2)
    expect(unmatchedConfigs).toHaveLength(0)
    expect(sheetsToDelete).toHaveLength(0)

    expect(matches[0].existingSheet.name).toBe('Contacts')
    expect(matches[0].configIndex).toBe(0)
    expect(matches[1].existingSheet.name).toBe('Companies')
    expect(matches[1].configIndex).toBe(1)
  })

  it('should match sheets by slug when name does not match', () => {
    const sheetConfigs = [
      {
        name: 'Updated Contacts', // Different name
        slug: 'contacts', // Same slug
        fields: [
          { key: 'name', type: 'string', label: 'Name' },
        ],
      },
    ]

    const { matches, unmatchedConfigs, sheetsToDelete } = matchSheets(
      mockExistingSheets,
      sheetConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(0)
    expect(sheetsToDelete).toHaveLength(1) // Companies sheet should be deleted

    expect(matches[0].existingSheet.name).toBe('Contacts')
    expect(matches[0].existingSheet.slug).toBe('contacts')
    expect(matches[0].configIndex).toBe(0)
    expect(sheetsToDelete[0].name).toBe('Companies')
  })

  it('should handle unmatched sheet configurations', () => {
    const sheetConfigs = [
      {
        name: 'Contacts',
        slug: 'contacts',
        fields: [
          { key: 'name', type: 'string', label: 'Name' },
        ],
      },
      {
        name: 'New Analytics Sheet',
        slug: 'analytics',
        fields: [
          { key: 'metric', type: 'string', label: 'Metric' },
        ],
      },
    ]

    const { matches, unmatchedConfigs, sheetsToDelete } = matchSheets(
      mockExistingSheets,
      sheetConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(sheetsToDelete).toHaveLength(1) // Companies sheet should be deleted

    expect(matches[0].existingSheet.name).toBe('Contacts')
    expect(unmatchedConfigs[0].config.name).toBe('New Analytics Sheet')
    expect(unmatchedConfigs[0].index).toBe(1)
    expect(sheetsToDelete[0].name).toBe('Companies')
  })

  it('should handle empty sheet configurations', () => {
    const sheetConfigs: Flatfile.SheetConfig[] = []

    const { matches, unmatchedConfigs, sheetsToDelete } = matchSheets(
      mockExistingSheets,
      sheetConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(0)
    expect(sheetsToDelete).toHaveLength(2) // All existing sheets should be deleted
  })

  it('should handle empty existing sheets', () => {
    const { matches, unmatchedConfigs, sheetsToDelete } = matchSheets(
      [],
      mockSheetConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(2)
    expect(sheetsToDelete).toHaveLength(0)
    expect(unmatchedConfigs[0].config.name).toBe('Contacts')
    expect(unmatchedConfigs[1].config.name).toBe('Companies')
  })

  it('should not match the same sheet twice', () => {
    const sheetConfigs = [
      {
        name: 'Contacts',
        slug: 'contacts',
        fields: [
          { key: 'name', type: 'string', label: 'Name' },
        ],
      },
      {
        name: 'Contacts', // Same name, should not match
        slug: 'contacts-2',
        fields: [
          { key: 'name', type: 'string', label: 'Name' },
        ],
      },
    ]

    const { matches, unmatchedConfigs, sheetsToDelete } = matchSheets(
      mockExistingSheets,
      sheetConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(sheetsToDelete).toHaveLength(1) // Companies sheet should be deleted

    expect(matches[0].existingSheet.name).toBe('Contacts')
    expect(matches[0].configIndex).toBe(0)
    expect(unmatchedConfigs[0].config.name).toBe('Contacts')
    expect(unmatchedConfigs[0].index).toBe(1)
    expect(sheetsToDelete[0].name).toBe('Companies')
  })

  it('should identify sheets to delete when no configurations match', () => {
    const sheetConfigs = [
      {
        name: 'Completely Different Sheet',
        slug: 'different',
        fields: [
          { key: 'data', type: 'string', label: 'Data' },
        ],
      },
    ]

    const { matches, unmatchedConfigs, sheetsToDelete } = matchSheets(
      mockExistingSheets,
      sheetConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(sheetsToDelete).toHaveLength(2) // Both existing sheets should be deleted

    expect(unmatchedConfigs[0].config.name).toBe('Completely Different Sheet')
    expect(sheetsToDelete.map(s => s.name)).toContain('Contacts')
    expect(sheetsToDelete.map(s => s.name)).toContain('Companies')
  })
})
