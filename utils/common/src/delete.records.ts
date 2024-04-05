import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'

export async function deleteRecords(
  sheetId: string,
  config: Omit<Flatfile.DeleteRecordsJobConfig, 'sheet'>
): Promise<void> {
  try {
    const { data: sheet } = await api.sheets.get(sheetId)
    await api.jobs.create({
      type: 'workbook',
      operation: 'delete-records',
      trigger: 'immediate',
      source: sheet.workbookId,
      config: {
        ...config,
        sheet: sheetId,
      },
    })
  } catch (error) {
    console.error('Error deleting records:', error)
    throw new Error('Error deleting records')
  }
}
