import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { RejectionResponse } from '@flatfile/util-response-rejection'

import { FlatfileClient } from '@flatfile/api'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'
import { responseRejectionHandler } from '@flatfile/util-response-rejection'

const api = new FlatfileClient()

export function webhookEgress(job: string, webhookUrl: string) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler(
        job,
        async (
          event: FlatfileEvent,
          tick: (
            progress: number,
            message?: string
          ) => Promise<Flatfile.JobResponse>
        ) => {
          const { workbookId } = event.context
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
            const response = await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                workbook: {
                  ...workbook,
                  sheets,
                },
              }),
            })

            if (response.status === 200) {
              const responseData = await response.json()
              const rejections: RejectionResponse = responseData.rejections

              if (rejections) {
                const rejectionResponse =
                  await responseRejectionHandler(rejections)
                return rejectionResponse
              }

              return {
                outcome: {
                  message: `Data was successfully submitted to the provided webhook. Go check it out at ${webhookUrl}.`,
                },
              }
            } else {
              logError(
                '@flatfile/plugin-webhook-egress',
                `Failed to submit data to ${webhookUrl}. Status: ${response.status} ${response.statusText}`
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
        }
      )
    )
  }
}
