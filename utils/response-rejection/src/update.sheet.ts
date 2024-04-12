import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import { chunkify, getRecordsRaw } from '@flatfile/util-common'
import { RejectedRecord } from '.'

export async function updateSheet(
  sheetId: string,
  rejectedRecords: RejectedRecord[],
  deleteSubmitted: boolean
) {
  const recordIds = rejectedRecords.map((record) => record.id)
  const chunkedRecordIds = chunkify<string>(recordIds, 100) // records get API call limits the id filter to 100 ids
  for (const ids of chunkedRecordIds) {
    const records = await getRecordsRaw(sheetId, {
      ids,
    })
    if (Array.isArray(records)) {
      records.forEach((record: Flatfile.Record_) => {
        const rejectedRecord = rejectedRecords.find(
          (item) => item.id === record.id
        )

        // Necessary record clean up to avoid Date/string type mismatch bug
        Object.values(record.values).forEach((value) => delete value.updatedAt)

        rejectedRecord?.values.forEach((value) => {
          if (record.values[value.field]) {
            record.values[value.field].messages = [
              { type: 'error', message: value.message },
            ]
          }
        })

        if (!deleteSubmitted) {
          record.values['submissionStatus'].value = rejectedRecord
            ? 'rejected'
            : 'submitted'
        }
      })

      try {
        await api.records.update(sheetId, records)
      } catch (error) {
        console.error('Error updating records:', error)
        throw new Error('Error updating records')
      }
    }
  }
}
