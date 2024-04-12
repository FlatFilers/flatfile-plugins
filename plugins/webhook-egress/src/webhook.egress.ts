import { Flatfile, FlatfileClient } from '@flatfile/api'
import type FlatfileListener from '@flatfile/listener'
import { FlatfileEvent } from '@flatfile/listener'
import { deleteRecords, getRecordsRaw, logError } from '@flatfile/util-common'
import { responseRejectionHandler } from '@flatfile/util-response-rejection'
import { prepareParts } from './fetch.and.process.sheets'
import { postToWebhook } from './post.to.webhook'
import type { SheetExport, WebhookEgressOptions } from './types'

const api = new FlatfileClient()

export function webhookEgress(
  job: string,
  url: string | URL,
  options: WebhookEgressOptions = {}
) {
  const {
    secretName = 'WEBHOOK_TOKEN',
    urlParams = [],
    pageSize = 10_000,
    filter = Flatfile.Filter.Valid,
    debug = false,
  } = options
  let deleteSubmitted = false

  return (listener: FlatfileListener) => {
    listener.on(
      'job:ready',
      { job, isPart: false },
      async (event: FlatfileEvent) => {
        const { jobId, workbookId } = event.context

        await api.jobs.ack(jobId, { info: 'Splitting Job', progress: 10 })

        const parts = await prepareParts(workbookId, pageSize, filter)
        if (parts.length > 0) {
          await api.jobs.split(jobId, { parts })
          await api.jobs.ack(jobId, {
            info: `Job Split into ${parts.length} parts.`,
            progress: 20,
          })
        } else {
          await api.jobs.complete(jobId, {
            outcome: { message: 'nothing to do' },
          })
        }
      }
    )

    listener.on(
      'job:ready',
      { job, isPart: true },
      async (event: FlatfileEvent) => {
        const { jobId, environmentId, spaceId } = event.context
        try {
          const job = await api.jobs.get(jobId)
          const { sheetId, pageNumber } = job.data.partData!

          const records = await getRecordsRaw(sheetId, {
            pageNumber,
            pageSize,
            filter,
          })

          if (records instanceof Error) {
            throw new Error(`Error fetching records: ${records.message}`)
          }

          const { data: sheet } = await api.sheets.get(sheetId)
          const sheetExport: SheetExport = { ...sheet, records }
          const responseData = await postToWebhook(
            sheetExport,
            url,
            urlParams,
            secretName,
            environmentId,
            spaceId
          )

          const { rejections } = responseData
          if (rejections) {
            const response = await responseRejectionHandler(rejections)
            deleteSubmitted = rejections.deleteSubmitted

            await api.jobs.complete(jobId, response.jobCompleteDetails)
          } else {
            await api.jobs.complete(jobId, {
              outcome: {
                message: `Data was successfully submitted to the provided webhook. Check it out at ${url}.`,
              },
            })
          }
        } catch (error) {
          if (debug) {
            logError('@flatfile/plugin-webhook-egress', error.message)
          }
          await api.jobs.fail(jobId, { outcome: { message: error.message } })
        }
      }
    )

    listener.on(
      'job:parts-completed',
      { job, isPart: false },
      async (event: FlatfileEvent) => {
        const { jobId, workbookId } = event.context
        if (deleteSubmitted) {
          const { data: sheets } = await api.sheets.list({ workbookId })
          for (const sheet of sheets) {
            const {
              data: {
                counts: { valid },
              },
            } = await api.sheets.getRecordCounts(sheet.id)
            if (valid > 0) await deleteRecords(sheet.id, { filter: 'valid' })
          }
        }
        await api.jobs.complete(jobId, {
          outcome: { message: 'This job is now complete.' },
        })
      }
    )
  }
}

export * from './types'
