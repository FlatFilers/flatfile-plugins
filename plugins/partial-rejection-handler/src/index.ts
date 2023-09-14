import api, { Flatfile } from '@flatfile/api'

export interface PartialRejection {
  sheets: PartialRejectionSheet[]
}

export interface PartialRejectionSheet {
  id: string
  name?: string
  rejectedRecords: PartialRejectionRecord[]
}

export interface PartialRejectionRecord {
  id: string
  values: { field: string; message: string }[]
}

export async function partialRejectionHandler(
  partialRejection: PartialRejection
): Promise<number> {
  let totalRejectedRecords = 0

  const results = await Promise.all(
    partialRejection.sheets.map((sheet) => updateSheet(sheet))
  )
  totalRejectedRecords = results.reduce((acc, val) => acc + val, 0)

  return totalRejectedRecords
}

async function updateSheet(sheet: PartialRejectionSheet): Promise<number> {
  if (!sheet.rejectedRecords?.length) {
    return 0
  }

  const rejectedRecordsIds = sheet.rejectedRecords.map((record) => record.id)
  const sheetRecords = await api.records.get(sheet.id)

  const rejectedSheetRecords: Flatfile.Record_[] =
    sheetRecords.data.records?.filter((record: Flatfile.Record_) =>
      rejectedRecordsIds.includes(record.id)
    )

  for (const record of rejectedSheetRecords || []) {
    const rejectedRecord: PartialRejectionRecord = sheet.rejectedRecords.find(
      (item) => item.id === record.id
    )
    for (const value of rejectedRecord.values) {
      if (record.values[value.field]) {
        record.values[value.field].messages = [
          {
            type: 'error',
            message: value.message,
          },
        ]
      }
    }
  }

  await api.records.update(sheet.id, rejectedSheetRecords)
  return rejectedRecordsIds.length
}
