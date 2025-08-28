import { Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type sql from 'mssql'
import { pollDatabaseStatus } from './database.poll.status'
import { restoreDatabase } from './database.restore'
import { s3Upload } from './s3.upload'
import { configureWorkbook } from './workbook.configure'

const api = new FlatfileClient()

export const foreignDBExtractor = () => {
  return (listener: FlatfileListener) => {
    // Step 1: Create resource setup job
    listener.on('file:created', async (event: FlatfileEvent) => {
      const { data: file } = await api.files.get(event.context.fileId)
      if (file.mode === 'export') {
        return
      }

      // Filter on MSSQL backup file type
      if (!file.name.endsWith('.bak')) {
        return
      }

      const jobs = await api.jobs.create({
        type: Flatfile.JobType.File,
        operation: 'extract-foreign-mssql-db',
        status: Flatfile.JobStatus.Ready,
        source: event.context.fileId,
        input: {
          fileName: file.name,
        },
      })
      await api.jobs.execute(jobs.data.id)
    })

    // Step 2: Create resources & create restore job
    listener.on(
      'job:ready',
      { operation: 'extract-foreign-mssql-db' },
      async (event: FlatfileEvent) => {
        const { spaceId, environmentId, fileId, jobId } = event.context

        const tick = async (progress: number, info?: string) => {
          return await api.jobs.ack(jobId, {
            progress,
            ...(info !== undefined && { info }),
          })
        }
        try {
          const job = await api.jobs.get(jobId)
          const { fileName } = job.data.input

          // Step 2.1: Create a workbook so we can use the workbookId to name the database
          await tick(5, 'Creating workbook')
          const { data: workbook } = await api.workbooks.create({
            name: `[file] ${fileName}`,
            labels: ['file'],
            spaceId,
            environmentId,
            storageStrategy: Flatfile.StorageStrategy.Foreigndb,
          })

          await api.files.update(fileId, {
            workbookId: workbook.id,
          })

          // Step 2.2: Upload file to S3, this is required to restore to RDS
          await tick(10, 'Uploading file to S3 bucket')
          await s3Upload(workbook.id, fileId)

          // Step 2.3: Restore DB from Backup on S3
          await tick(50, 'Restoring database')
          const connectionConfig: sql.config = await restoreDatabase(
            workbook.id,
            fileId
          )

          // Step 2.4: Poll for database availability
          await tick(60, 'Polling for database availability')
          await pollDatabaseStatus(connectionConfig.database)

          // Step 2.5: Retrieve user credentials for the database
          await tick(85, 'Configuring workbook')
          await configureWorkbook(workbook.id)

          // Step 2.7: Update file with workbookId
          await tick(95, 'Updating file')
          await api.files.update(fileId, {
            status: 'complete',
          })

          await api.jobs.complete(jobId, {
            info: 'Extraction complete',
            outcome: {
              message: 'Extracted DB from backup',
            },
          })
        } catch (e) {
          await api.files.update(fileId, {
            status: 'failed',
          })
          await api.jobs.fail(jobId, {
            info: e.message,
          })
        }
      }
    )
  }
}
