import { describe, expect, it } from 'vitest'
import { matchWorkbooks } from './workbook.matching'
import type { Flatfile } from '@flatfile/api'

describe('workbook matching utility', () => {
  const mockExistingWorkbooks: Flatfile.Workbook[] = [
    {
      id: 'wb-1',
      name: 'Contacts Workbook',
      labels: ['existing'],
      sheets: [],
      actions: [],
      spaceId: 'space-1',
      environmentId: 'env-1',
      namespace: 'portal',
    },
    {
      id: 'wb-2',
      name: 'Companies Workbook',
      labels: ['existing'],
      sheets: [],
      actions: [],
      spaceId: 'space-1',
      environmentId: 'env-1',
      namespace: 'portal',
    },
  ] as Flatfile.Workbook[]

  it('should match workbooks by name', () => {
    const workbookConfigs = [
      { name: 'Contacts Workbook', labels: ['updated'] },
      { name: 'Companies Workbook', labels: ['updated'] },
    ]

    const { matches, unmatchedConfigs, workbooksToDelete } = matchWorkbooks(
      mockExistingWorkbooks,
      workbookConfigs
    )

    expect(matches).toHaveLength(2)
    expect(unmatchedConfigs).toHaveLength(0)
    expect(workbooksToDelete).toHaveLength(0)

    expect(matches[0].existingWorkbook.name).toBe('Contacts Workbook')
    expect(matches[0].configIndex).toBe(0)
    expect(matches[1].existingWorkbook.name).toBe('Companies Workbook')
    expect(matches[1].configIndex).toBe(1)
  })

  it('should handle unmatched workbook configurations', () => {
    const workbookConfigs = [
      { name: 'Contacts Workbook', labels: ['updated'] }, // Should match
      { name: 'New Analytics Workbook', labels: ['new'] }, // Should not match
    ]

    const { matches, unmatchedConfigs, workbooksToDelete } = matchWorkbooks(
      mockExistingWorkbooks,
      workbookConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(workbooksToDelete).toHaveLength(1) // Companies Workbook should be deleted

    expect(matches[0].existingWorkbook.name).toBe('Contacts Workbook')
    expect(unmatchedConfigs[0].config.name).toBe('New Analytics Workbook')
    expect(unmatchedConfigs[0].index).toBe(1)
    expect(workbooksToDelete[0].name).toBe('Companies Workbook')
  })

  it('should handle empty workbook configurations', () => {
    const workbookConfigs: Partial<Flatfile.CreateWorkbookConfig>[] = []

    const { matches, unmatchedConfigs, workbooksToDelete } = matchWorkbooks(
      mockExistingWorkbooks,
      workbookConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(0)
    expect(workbooksToDelete).toHaveLength(2) // All existing workbooks should be deleted
  })

  it('should handle empty existing workbooks', () => {
    const workbookConfigs = [
      { name: 'New Workbook', labels: ['new'] },
    ]

    const { matches, unmatchedConfigs, workbooksToDelete } = matchWorkbooks(
      [],
      workbookConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(workbooksToDelete).toHaveLength(0)
    expect(unmatchedConfigs[0].config.name).toBe('New Workbook')
  })

  it('should not match the same workbook twice', () => {
    const workbookConfigs = [
      { name: 'Contacts Workbook', labels: ['first'] },
      { name: 'Contacts Workbook', labels: ['second'] }, // Same name, should not match
    ]

    const { matches, unmatchedConfigs, workbooksToDelete } = matchWorkbooks(
      mockExistingWorkbooks,
      workbookConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(workbooksToDelete).toHaveLength(1) // Companies Workbook should be deleted

    expect(matches[0].existingWorkbook.name).toBe('Contacts Workbook')
    expect(matches[0].configIndex).toBe(0)
    expect(unmatchedConfigs[0].config.name).toBe('Contacts Workbook')
    expect(unmatchedConfigs[0].index).toBe(1)
    expect(workbooksToDelete[0].name).toBe('Companies Workbook')
  })

  it('should handle workbook configurations without names', () => {
    const workbookConfigs = [
      { labels: ['no-name'] }, // No name field
      { name: 'Contacts Workbook', labels: ['has-name'] },
    ]

    const { matches, unmatchedConfigs, workbooksToDelete } = matchWorkbooks(
      mockExistingWorkbooks,
      workbookConfigs
    )

    expect(matches).toHaveLength(1)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(workbooksToDelete).toHaveLength(1) // Companies Workbook should be deleted

    expect(matches[0].existingWorkbook.name).toBe('Contacts Workbook')
    expect(matches[0].configIndex).toBe(1)
    expect(unmatchedConfigs[0].config.labels).toContain('no-name')
    expect(unmatchedConfigs[0].index).toBe(0)
    expect(workbooksToDelete[0].name).toBe('Companies Workbook')
  })

  it('should identify workbooks to delete when no configurations match', () => {
    const workbookConfigs = [
      { name: 'Completely Different Workbook', labels: ['new'] },
    ]

    const { matches, unmatchedConfigs, workbooksToDelete } = matchWorkbooks(
      mockExistingWorkbooks,
      workbookConfigs
    )

    expect(matches).toHaveLength(0)
    expect(unmatchedConfigs).toHaveLength(1)
    expect(workbooksToDelete).toHaveLength(2) // Both existing workbooks should be deleted

    expect(unmatchedConfigs[0].config.name).toBe('Completely Different Workbook')
    expect(workbooksToDelete.map(wb => wb.name)).toContain('Contacts Workbook')
    expect(workbooksToDelete.map(wb => wb.name)).toContain('Companies Workbook')
  })
})
