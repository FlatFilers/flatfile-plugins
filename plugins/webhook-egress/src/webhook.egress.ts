import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'
import axios from 'axios'

export function webhookEgress(job: string, webhookUrl?: string) {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler(job, async (event) => {
        const { workbookId, payload } = event.context
        const { data: sheets } = await api.sheets.list({ workbookId })

        const records: { [name: string]: any } = {}
        for (const [index, element] of sheets.entries()) {
          records[`Sheet[${index}]`] = await api.records.get(element.id)
        }

        try {
          const webhookReceiver = webhookUrl || process.env.WEBHOOK_SITE_URL
          const response = await axios.post(
            webhookReceiver,
            {
              ...payload,
              method: 'axios',
              sheets,
              records,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.status === 200) {
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
