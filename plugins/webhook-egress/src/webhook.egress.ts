import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import type { FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'
import type { RejectionResponse } from '@flatfile/util-response-rejection'
import { responseRejectionHandler } from '@flatfile/util-response-rejection'

export function webhookEgress(job: string, url: string) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler(job, async (event, tick) => {
        const { workbookId } = event.context
        const { data: workbook } = await api.workbooks.get(workbookId)
        const { data: workbookSheets } = await api.sheets.list({ workbookId })

        await tick(30, 'Getting workbook data')

        interface EnhancedSheet extends Flatfile.Sheet {
          records: Flatfile.RecordsWithLinks
        }
        const sheets: Array<EnhancedSheet> = []
        for (const [_, sheet] of workbookSheets.entries()) {
          const { data: records } = await api.records.get(sheet.id)
          sheets.push({
            ...sheet,
            ...records,
          })
        }

        await tick(60, 'Posting data to webhook')

        try {
          const response = await fetch(url, {
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
              return await responseRejectionHandler(rejections)
            }

            return {
              outcome: {
                message: `Data was successfully submitted to ${url}.`,
              },
            }
          } else {
            logError(
              '@flatfile/plugin-webhook-egress',
              `Failed to submit data to ${url}. Status: ${response.status} ${response.statusText}`
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
