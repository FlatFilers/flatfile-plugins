import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'
import axios from 'axios'
import {
  RejectionResponse,
  responseRejectionHandler,
} from '../../../utils/response-rejection/src' // TODO: replace with '@flatfile/util-response-rejection'

export function webhookEgress(job: string, webhookUrl?: string) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler(job, async (event, tick) => {
        const { workbookId, payload } = event.context
        const { data: workbook } = await api.workbooks.get(workbookId)
        const { data: workbookSheets } = await api.sheets.list({ workbookId })

        await tick(30, 'Getting workbook data')

        const sheets = []
        for (const [_, element] of workbookSheets.entries()) {
          const { data: records } = await api.records.get(element.id)
          sheets.push({
            ...element,
            ...records,
          })
        }

        await tick(60, 'Posting data to webhook')

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
            const rejections: RejectionResponse = response.data.rejections
            if (rejections) {
              return await responseRejectionHandler(rejections)
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
          // Throw error to fail job
          throw new Error(`Error posting data to webhook`)
        }
      })
    )
  }
}
