import api, { Flatfile } from '@flatfile/api'
import FlatfileListener, { FlatfileEvent } from '@flatfile/listener'
import sql from 'mssql'
import { generateSheets } from './generate.sheets'
import {
  DBUser,
  getUser,
  pollDatabaseStatus,
  restoreDatabase,
} from './restore.database'
import { s3Upload } from './upload.s3'

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
          await pollDatabaseStatus(connectionConfig)

          // Step 2.5: Retrieve user credentials for the database
          await tick(85, 'Retrieving database user credentials')
          try {
            const user = (await getUser(connectionConfig.database)) as DBUser
            connectionConfig.user = user.username
            connectionConfig.password = user.password
          } catch (e) {
            throw e
          }

          // Step 2.6: Create a Workbook
          // Get column names for all tables, loop through them and create Sheets for each table
          await tick(90, 'Creating workbook')
          const sheets = await generateSheets(connectionConfig)

          // Sheets need to be added to the workbook before adding the connectionType to ensure the correct ephemeral
          // driver is used
          await api.workbooks.update(workbook.id, {
            sheets,
          })

          await api.workbooks.update(workbook.id, {
            metadata: {
              connectionType: 'FOREIGN_MSSQL',
              connectionConfig,
            },
          })

          // Step 2.7: Update file with workbookId
          await tick(95, 'Updating file')
          await api.files.update(fileId, {
            workbookId: workbook.id,
          })

          await api.jobs.complete(jobId, {
            info: 'Extraction complete',
            outcome: {
              message: 'Extracted DB from backup',
            },
          })
        } catch (e) {
          await api.jobs.fail(jobId, {
            info: e.message,
          })
        }
      }
    )
  }
}
