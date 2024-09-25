import {
  FlatfileListener,
  FlatfileEvent,
  FlatfileRecord,
} from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { ActionExecutionContext } from '@flatfile/hooks'
import api from '@flatfile/api'
import axios from 'axios'

interface PluginConfig {
  apiEndpoint: string
  authToken: string
  dataMapping: {
    readonly [key: string]: string
  }
  batchSize: number
  maxRetries: number
  retryDelay: number
}

export default function (
  listener: FlatfileListener,
  config: PluginConfig
): void {
  const {
    apiEndpoint,
    authToken,
    dataMapping,
    batchSize,
    maxRetries,
    retryDelay,
  } = config

  listener.use(
    recordHook('contacts', (record: FlatfileRecord) => {
      // Validation logic here
      return record
    })
  )

  listener.on('job:ready', async ({ context, payload }) => {
    const { jobId } = payload

    try {
      const records = await api.records.get(payload.spaceId, payload.fileId)
      const batches = chunkArray(records.data, batchSize)
      let totalExported = 0
      const failedRecords: FlatfileRecord[] = []
      let successfulBatches = 0
      let failedBatches = 0

      for (const batch of batches) {
        const processedBatch = batch.map((record) =>
          processRecord(record, dataMapping)
        )
        try {
          await retryOperation(
            () => exportToExternalAPI(processedBatch, apiEndpoint, authToken),
            maxRetries,
            retryDelay
          )
          totalExported += batch.length
          successfulBatches++
          await logSuccess(context, jobId, batch.length)
        } catch (error) {
          console.error('Failed to export batch after retries:', error)
          failedRecords.push(...batch)
          failedBatches++
          await logFailure(context, jobId, batch.length, error)
        }

        await updateJobProgress(
          context,
          jobId,
          totalExported,
          records.data.length
        )
      }

      await completeJob(
        context,
        jobId,
        totalExported,
        failedRecords,
        successfulBatches,
        failedBatches
      )
      await sendUserNotification(
        context,
        jobId,
        totalExported,
        failedRecords.length
      )
    } catch (error) {
      await handleExportError(context, jobId, error)
    }
  })
}

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, (index + 1) * size)
  )
}

function processRecord(
  record: FlatfileRecord,
  mapping: PluginConfig['dataMapping']
): Record<string, unknown> {
  return Object.entries(mapping).reduce((acc, [from, to]) => {
    acc[to] = record.get(from)
    return acc
  }, {} as Record<string, unknown>)
}

async function exportToExternalAPI(
  data: Record<string, unknown>[],
  apiEndpoint: string,
  authToken: string
): Promise<void> {
  try {
    await axios.post(apiEndpoint, data, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed: ${error.message}`)
    }
    throw error
  }
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError || new Error('Operation failed after max retries')
}

async function logSuccess(
  context: ActionExecutionContext,
  jobId: string,
  count: number
): Promise<void> {
  await api.jobs.log(jobId, {
    message: `Successfully exported ${count} records.`,
    level: 'info',
  })
}

async function logFailure(
  context: ActionExecutionContext,
  jobId: string,
  count: number,
  error: unknown
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error)
  await api.jobs.log(jobId, {
    message: `Failed to export ${count} records. Error: ${errorMessage}`,
    level: 'error',
  })
}

async function updateJobProgress(
  context: ActionExecutionContext,
  jobId: string,
  exported: number,
  total: number
): Promise<void> {
  await api.jobs.update(jobId, {
    status: 'active',
    progress: {
      completed: exported,
      total: total,
    },
  })
}

async function completeJob(
  context: ActionExecutionContext,
  jobId: string,
  totalExported: number,
  failedRecords: FlatfileRecord[],
  successfulBatches: number,
  failedBatches: number
): Promise<void> {
  const outcome =
    failedRecords.length > 0
      ? {
          message: `Exported ${totalExported} records. Failed to export ${failedRecords.length} records.`,
          failedRecords: failedRecords.map((record) => record.id),
          successfulBatches,
          failedBatches,
        }
      : {
          message: `Successfully exported ${totalExported} records to the external API.`,
          successfulBatches,
        }

  await api.jobs.complete(jobId, { outcome })
}

async function sendUserNotification(
  context: ActionExecutionContext,
  jobId: string,
  successCount: number,
  failureCount: number,
  errorMessage?: string
): Promise<void> {
  const message = errorMessage
    ? `Export job ${jobId} failed. Error: ${errorMessage}`
    : `Export job ${jobId} completed. Successfully exported ${successCount} records. Failed to export ${failureCount} records.`

  await api.jobs.log(jobId, {
    message: `User notification: ${message}`,
    level: 'info',
  })

  // Implement actual user notification logic here (e.g., email, webhook)
}

async function handleExportError(
  context: ActionExecutionContext,
  jobId: string,
  error: unknown
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error('Error during export:', errorMessage)
  await api.jobs.fail(jobId, {
    outcome: {
      message: 'Failed to export records to the external API.',
      error: errorMessage,
    },
  })
  await sendUserNotification(context, jobId, 0, 0, errorMessage)
}
