import api, { Flatfile } from '@flatfile/api'
import { processRecords } from '@flatfile/util-common'

export interface RejectionResponse {
  id: string
  message?: string
  deleteSubmitted?: boolean
  sheets: SheetRejections[]
}

export interface SheetRejections {
  sheetId: string
  rejectedRecords: RecordRejections[]
}

export interface RecordRejections {
  id: string
  values: { field: string; message: string }[]
}

export async function responseRejectionHandler(
  responseRejection: RejectionResponse
): Promise<Flatfile.JobCompleteDetails> {
  let totalRejectedRecords = 0

  for (const sheet of responseRejection.sheets || []) {
    const count = await updateSheet(sheet, responseRejection.deleteSubmitted)
    totalRejectedRecords += count
  }

  const message = responseRejection.message ?? getMessage(totalRejectedRecords)
  let next
  if (!responseRejection.deleteSubmitted && totalRejectedRecords > 0) {
    next = getNext(totalRejectedRecords, responseRejection.sheets[0].sheetId)
  }

  return {
    outcome: {
      buttonText: 'Close',
      heading: totalRejectedRecords > 0 ? 'Rejected Records' : 'Success!',
      acknowledge: true,
      ...(next && !responseRejection.deleteSubmitted && { next }),
      message,
    },
  }
}

function getMessage(totalRejectedRecords) {
  return totalRejectedRecords > 0
    ? `During the data submission process, ${totalRejectedRecords} records were rejected. Please review and correct these records before resubmitting.`
    : 'The data has been successfully submitted without any rejections. This task is now complete.'
}

function getNext(
  totalRejectedRecords: number,
  sheetId: string
): Flatfile.JobOutcomeNext | undefined {
  return totalRejectedRecords > 0
    ? {
        type: 'id',
        id: sheetId,
        label: 'View Rejected Records',
        query: 'searchField=submissionStatus&searchValue=rejected',
      }
    : undefined
}

async function updateSheet(
  sheetRejections: SheetRejections,
  deleteSubmitted: boolean
): Promise<number> {
  if (!deleteSubmitted) {
    await addSubmissionStatusField(sheetRejections.sheetId)
  }

  const recordIds = sheetRejections.rejectedRecords.map((record) => record.id)
  await processRecords(
    sheetRejections.sheetId,
    async (records: Flatfile.RecordsWithLinks, _pageNumber?: number) => {
      if (!records.length) {
        return
      }
      records.forEach((record) => {
        const rejectedRecord = sheetRejections.rejectedRecords.find(
          (item) => item.id === record.id
        )

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
        await api.records.update(sheetRejections.sheetId, records)
      } catch (error) {
        console.error('Error updating records:', error)
        throw new Error('Error updating records')
      }

      if (
        deleteSubmitted &&
        records.length !== sheetRejections.rejectedRecords.length
      ) {
        await deleteValidRecords(sheetRejections.sheetId)
      }
    },
    { ids: recordIds }
  )

  return sheetRejections.rejectedRecords.length
}

async function addSubmissionStatusField(sheetId: string): Promise<void> {
  try {
    const { data: sheet } = await api.sheets.get(sheetId)
    if (
      !sheet.config.fields.some((field) => field.key === 'submissionStatus')
    ) {
      await api.sheets.addField(sheet.id, {
        key: 'submissionStatus',
        label: 'Submission Status',
        type: 'enum',
        readonly: true,
        config: {
          allowCustom: false,
          options: [
            { label: 'Rejected', value: 'rejected' },
            { label: 'Submitted', value: 'submitted' },
          ],
        },
      })
    }
  } catch (error) {
    console.error('Error adding rejection status field:', error)
    throw 'Error adding rejection status field'
  }
}

async function deleteValidRecords(sheetId: string): Promise<void> {
  try {
    const { data: sheet } = await api.sheets.get(sheetId)
    await api.jobs.create({
      type: 'workbook',
      operation: 'delete-records',
      trigger: 'immediate',
      source: sheet.workbookId,
      config: {
        sheet: sheetId,
        filter: 'valid',
      },
    })
  } catch (error) {
    console.error('Error deleting all records:', error)
    throw new Error('Error deleting all records')
  }
}
