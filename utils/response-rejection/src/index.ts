import api, { Flatfile } from '@flatfile/api'

export interface ResponseRejection {
  sheets: ResponseRejectionSheet[]
}

export interface ResponseRejectionSheet {
  id: string
  name?: string
  rejectedRecords: ResponseRejectionRecord[]
}

export interface ResponseRejectionRecord {
  id: string
  values: { field: string; message: string }[]
}

export async function responseRejectionHandler(
  partialRejection: ResponseRejection
): Promise<number> {
  let totalRejectedRecords = 0

  const results = await Promise.all(
    partialRejection.sheets.map((sheet) => updateSheet(sheet))
  )
  totalRejectedRecords = results.reduce((acc, val) => acc + val, 0)

  return totalRejectedRecords
}

async function updateSheet(sheet: ResponseRejectionSheet): Promise<number> {
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
    const rejectedRecord: ResponseRejectionRecord = sheet.rejectedRecords.find(
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
