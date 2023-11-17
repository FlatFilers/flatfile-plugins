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
): Promise<void | Flatfile.JobCompleteDetails> {
  let totalRejectedRecords = 0

  // Using a for...of loop to handle asynchronous operations
  for (const sheet of responseRejection.sheets || []) {
    const count = await updateSheet(sheet, responseRejection.deleteSubmitted)
    totalRejectedRecords += count
  }

  const message = responseRejection.message ?? getMessage(totalRejectedRecords)
  const next = getNext(totalRejectedRecords)

  return {
    outcome: {
      heading: totalRejectedRecords > 0 ? 'Rejected Records' : 'Success!',
      acknowledge: true,
      ...(next && { next }),
      message,
    },
  }
}

function getMessage(totalRejectedRecords) {
  return totalRejectedRecords > 0
    ? `${totalRejectedRecords} record(s) were rejected during data submission. Review the rejection notes, fix, then resubmit.`
    : 'Data was successfully submitted.'
}

function getNext(totalRejectedRecords): Flatfile.JobOutcomeNext | undefined {
  return totalRejectedRecords > 0
    ? {
        type: 'url',
        url: '?filter=error',
        label: 'See rejections',
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

  await processRecords(sheetRejections.sheetId, async (records) => {
    await updateRecords(sheetRejections, records, deleteSubmitted)
  })

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

async function updateRecords(
  rejections: SheetRejections,
  records: Flatfile.RecordsWithLinks,
  deleteSubmitted: boolean
): Promise<void> {
  records.forEach((record) => {
    const rejectedRecord = rejections.rejectedRecords.find(
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
    await api.records.update(rejections.sheetId, records)
  } catch (error) {
    console.error('Error updating records:', error)
    throw new Error('Error updating records')
  }

  if (deleteSubmitted && records.length !== rejections.rejectedRecords.length) {
    await deleteValidRecords(rejections.sheetId)
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
