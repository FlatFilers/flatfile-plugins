import api, { Flatfile } from '@flatfile/api'
import FlatfileListener, { FlatfileEvent } from '@flatfile/listener'
import { generateSheets } from './generate.sheets'
import { restoreDatabase } from './restore.database'
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

          // Step 1: Upload file to S3
          await tick(10, 'Uploading file to S3 bucket')
          const arn = await s3Upload(fileId)

          // Step 2: Create a Workbook
          await tick(45, 'Creating workbook')

          // Create a workbook so we can use the workbookId to name the database
          const { data: workbook } = await api.workbooks.create({
            name: `[file] ${fileName}`,
            labels: ['file'],
            spaceId,
            environmentId,
          })

          // Step 3: Restore DB from Backup
          await tick(50, 'Restoring database')
          const connectionConfig = await restoreDatabase(arn, workbook.id)

          // Step 4: Create a Workbook
          // Get column names for all tables, loop through them and create Sheets for each table
          await tick(90, 'Creating workbook')
          const sheets = await generateSheets(connectionConfig)

          // Sheets need to be added before adding the connectionType to ensure the correct ephemeral driver is used
          await api.workbooks.update(workbook.id, {
            sheets,
          })

          await api.workbooks.update(workbook.id, {
            metadata: {
              connectionType: 'FOREIGN_MSSQL',
              connectionConfig,
            },
          })

          // Step 5: Update file with workbookId
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
          console.log(`error ${e}`)
          await api.jobs.fail(jobId, {
            info: `Extraction failed ${e.message}`,
          })
        }
      }
    )
  }
}
