import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { asyncMap } from 'modern-async'

interface Part {
  sheetId: string
  pageNumber: number
  pageSize: number
}

export async function prepareParts(
  workbookId: string,
  pageSize: number,
  filter: Flatfile.Filter
): Promise<Array<Part>> {
  const { data: sheets } = await api.sheets.list({ workbookId })

  const partsArrays = await asyncMap(sheets, async (sheet) => {
    const {
      data: {
        counts: { total },
      },
    } = await api.sheets.getRecordCounts(sheet.id, { filter })
    return Array.from({ length: Math.ceil(total / pageSize) }, (_, index) => ({
      sheetId: sheet.id,
      pageNumber: index + 1,
      pageSize,
    }))
  })

  return partsArrays.flat()
}
