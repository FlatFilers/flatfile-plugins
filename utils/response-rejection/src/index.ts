import { Flatfile, FlatfileClient } from '@flatfile/api'
import { deleteRecords, processRecords } from '@flatfile/util-common'

const api = new FlatfileClient()

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
  const sheetId = sheetRejections.sheetId
  if (!deleteSubmitted) {
    await addSubmissionStatusField(sheetId)
  }

  await processRecords(
    sheetId,
    async (records: Flatfile.RecordsWithLinks, _pageNumber?: number) => {
      if (!records.length) {
        return
      }

      /**
       * If deleteSubmitted is false, the submissionStatus field is populated appropriate. If the listener also has a
       * recordHook, the recordHook will be triggered causing the message to be discarded. To avoid this, we're updating
       * the record twice. First time sets the submissionStatus field which triggers the recordHook. Second time updates
       * the record with the rejection messages which does not trigger the recordHook since no value is changed.
       */
      if (!deleteSubmitted) {
        records.forEach((record) => {
          const rejectedRecord = sheetRejections.rejectedRecords.find(
            (item) => item.id === record.id
          )
          record.values['submissionStatus'].value = rejectedRecord
            ? 'rejected'
            : 'submitted'
        })

        try {
          await api.records.update(sheetId, records)
        } catch (error) {
          console.error('Error updating records:', error)
          throw new Error('Error updating records')
        }
      }

      // A short timeout avoids race condition with the recordHook
      await new Promise((resolve) => setTimeout(resolve, 250))

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
      })

      try {
        await api.records.update(sheetId, records)
      } catch (error) {
        console.error('Error updating records:', error)
        throw new Error('Error updating records')
      }
    }
  )

  deleteSubmitted &&
    (await deleteRecords(sheetId, {
      filter: 'valid',
    }))

  return sheetRejections.rejectedRecords.length
}

async function addSubmissionStatusField(sheetId: string): Promise<void> {
  try {
    const { data: sheet } = await api.sheets.get(sheetId)
    if (
      !sheet.config.fields.some((field) => field.key === 'submissionStatus')
    ) {
      await api.sheets.addField(sheet.id, {
        body: {
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
        },
      })
    }
  } catch (error) {
    console.error('Error adding rejection status field:', error)
    throw 'Error adding rejection status field'
  }
}
