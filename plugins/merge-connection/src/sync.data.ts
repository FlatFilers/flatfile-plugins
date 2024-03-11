import api from '@flatfile/api'
import { MergeClient } from '@mergeapi/merge-node-client'
import { handleError, mapRecords } from './utils'

export async function syncData(
  mergeClient: MergeClient,
  sheetId: string,
  category: string,
  slug: string
) {
  try {
    await deleteSheetRecords(sheetId)

    const model = mergeClient[category as keyof MergeClient]
    let paginatedList: { results: any[]; next?: string } | null = null
    do {
      paginatedList = (await (model[slug as keyof typeof model] as any).list({
        cursor: paginatedList?.next,
      })) as { results: any[]; next?: string }
      const records = mapRecords(paginatedList.results)
      if (records.length > 0) {
        await api.records.insert(sheetId, records, {
          compressRequestBody: true,
        })
      }
    } while (paginatedList?.next)
  } catch (e) {
    console.error(e)
    // Don't fail here, this will fail the entire sync
    // throw new Error(`Error syncing ${slug} sheet`)
  }
}

async function deleteSheetRecords(sheetId: string) {
  try {
    const { data: sheet } = await api.sheets.get(sheetId)
    if (sheet.countRecords.total > 0) {
      await api.jobs.create({
        type: 'workbook',
        operation: 'delete-records',
        trigger: 'immediate',
        source: sheet.workbookId,
        config: {
          sheet: sheetId,
          filter: 'all',
        },
      })
    }
  } catch (e) {
    handleError(e, `Error deleting records from sheet ${sheetId}`)
  }
}
