import { type Flatfile } from '@flatfile/api'
import { type FlatfileEvent, type FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { getSheetLength, Simplified } from '@flatfile/util-common'
import {
  exportToExternalAPI,
  processRecord,
  retryOperation,
} from './external.api.utils'

export interface PluginConfig {
  job: string
  apiEndpoint: string
  authToken: string
  dataMapping: {
    readonly [key: string]: string
  }
  batchSize: number
  maxRetries: number
  retryDelay: number
}

export const externalApiExportPlugin = (config: PluginConfig) => {
  return (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        { operation: config.job },
        async (
          event: FlatfileEvent,
          tick: (
            progress: number,
            message?: string
          ) => Promise<Flatfile.JobResponse>
        ) => {
          const { sheetId } = event.context

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

              const processedBatch = records.map((record) =>
                processRecord(record, config.dataMapping)
              )

              try {
                await retryOperation(
                  () =>
                    exportToExternalAPI(
                      processedBatch,
                      config.apiEndpoint,
                      config.authToken
                    ),
                  config.maxRetries,
                  config.retryDelay
                )
                totalExported += processedBatch.length
                successfulBatches++
              } catch (error) {
                console.error('Failed to export batch after retries:', error)
                failedRecords += processedBatch.length
              }

              const progress = (successfulBatches / batchCount) * 100
              await tick(
                progress,
                `Exported ${totalExported} records. Failed to export ${failedRecords} records.`
              )
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
