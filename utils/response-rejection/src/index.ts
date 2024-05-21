import type { Flatfile } from '@flatfile/api'

import { FlatfileClient } from '@flatfile/api'
import { addSubmissionStatusField } from './prepare.sheet'
import { updateSheet } from './update.sheet'

const api = new FlatfileClient()

export interface RejectionResponse {
  id: string
  message?: string
  deleteSubmitted?: boolean
  rejectedRecords: RejectedRecord[]
}

export interface RejectedRecord {
  id: string
  values: { field: string; message: string }[]
}

export interface RejectionHandlerResponse {
  rejectedRecordsCount: number
  jobCompleteDetails: Flatfile.JobCompleteDetails
}

export async function responseRejectionHandler(
  responseRejection: RejectionResponse
): Promise<RejectionHandlerResponse> {
  const {
    id: sheetId,
    deleteSubmitted,
    message,
    rejectedRecords,
  } = responseRejection

  if (!deleteSubmitted) {
    await addSubmissionStatusField(sheetId)
  }

  await updateSheet(sheetId, rejectedRecords, deleteSubmitted ?? false)

  let next
  if (!deleteSubmitted && rejectedRecords.length > 0) {
    next = getNext(rejectedRecords.length, sheetId)
  }

  return {
    rejectedRecordsCount: rejectedRecords.length,
    jobCompleteDetails: {
      outcome: {
        buttonText: 'Close',
        heading: rejectedRecords.length > 0 ? 'Rejected Records' : 'Success!',
        acknowledge: true,
        ...(next && !deleteSubmitted && { next }),
        message: message ?? getMessage(rejectedRecords.length),
      },
    },
  }
}

function getMessage(totalRejectedRecords: number) {
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
