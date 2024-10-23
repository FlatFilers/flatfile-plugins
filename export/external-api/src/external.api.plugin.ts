import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { getSheetLength, Simplified } from '@flatfile/util-common'
import { exportToExternalAPI, retryOperation } from './external.api.utils'

export interface PluginConfig {
  job: string
  apiEndpoint: string
  secretName: string
  batchSize: number
  maxRetries: number
  retryDelay: number
}

export const exportToExternalAPIPlugin = (config: PluginConfig) => {
  return (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        `sheet:${config.job}`,
        async (
          event: FlatfileEvent,
          tick: (
            progress: number,
            message?: string
          ) => Promise<Flatfile.JobResponse>
        ) => {
          const { sheetId } = event.context

          const authToken = await event.secrets(config.secretName)

          try {
            let totalExported = 0
            let failedRecords = 0
            let successfulBatches = 0

            const sheetLength = await getSheetLength(sheetId)
            const batchCount = Math.ceil(sheetLength / config.batchSize)

            let pageNumber = 1
            while (pageNumber <= batchCount) {
              const records = await Simplified.getAllRecords(sheetId, {
                pageSize: config.batchSize,
                pageNumber,
              })

              try {
                await retryOperation(
                  () =>
                    exportToExternalAPI(records, config.apiEndpoint, authToken),
                  config.maxRetries,
                  config.retryDelay
                )
                totalExported += records.length
                successfulBatches++
              } catch (error) {
                console.error('Failed to export batch after retries:', error)
                failedRecords += records.length
              }

              const progress = ((pageNumber - 1) / batchCount) * 100
              await tick(
                progress,
                `Exported ${totalExported} records. Failed to export ${failedRecords} records.`
              )
              pageNumber++
            }

            return {
              info: `Exported ${totalExported} records. Failed to export ${failedRecords} records.`,
            }
          } catch (error) {
            console.error('Error during export:', (error as Error).message)

            throw new Error('An error occurred during export.')
          }
        }
      )
    )
  }
}
