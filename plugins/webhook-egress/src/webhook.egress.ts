import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'
import {
  ResponseRejection,
  responseRejectionHandler,
} from '@flatfile/util-response-rejection'
import axios from 'axios'

export function webhookEgress(job: string, webhookUrl?: string) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler(job, async (event, tick) => {
        const { workbookId, payload } = event.context
        const { data: workbook } = await api.workbooks.get(workbookId)
        const { data: workbookSheets } = await api.sheets.list({ workbookId })

        tick(30, 'Getting workbook data')

        const sheets = []
        for (const [_, element] of workbookSheets.entries()) {
          const { data: records } = await api.records.get(element.id)
          sheets.push({
            ...element,
            ...records,
          })
        }

        tick(60, 'Posting data to webhook')

        try {
          const webhookReceiver = webhookUrl || process.env.WEBHOOK_SITE_URL
          const response = await axios.post(
            webhookReceiver,
            {
              ...payload,
              workbook: {
                ...workbook,
                sheets,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.status === 200) {
            const rejections: ResponseRejection = response.data.rejections
            if (rejections) {
              const totalRejectedRecords = await responseRejectionHandler(
                rejections
              )
              return {
                outcome: {
                  next: {
                    type: 'id',
                    id: rejections.id,
                    label: 'See rejections',
                  },
                  message: `${totalRejectedRecords} record(s) were rejected during data submission. Review the rejection notes, fix, then resubmit.`,
                },
              }
            }
            return {
              outcome: {
                message: `Data was successfully submitted to the provided webhook. Go check it out at ${webhookReceiver}.`,
              },
            }
          } else {
            logError(
              '@flatfile/plugin-webhook-egress',
              `Failed to submit data to ${webhookReceiver}. Status: ${response.status} ${response.statusText}`
            )
            return {
              outcome: {
                message: `Data was not successfully submitted to the provided webhook. Status: ${response.status} ${response.statusText}`,
              },
            }
          }
        } catch (error) {
          logError(
            '@flatfile/plugin-webhook-egress',
            JSON.stringify(error, null, 2)
          )

          return {
            outcome: {
              message:
                "This job failed probably because it couldn't find the webhook URL.",
            },
          }
        }
      })
    )
  }
}
