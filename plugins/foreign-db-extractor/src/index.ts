import api, { Flatfile } from '@flatfile/api'
import FlatfileListener from '@flatfile/listener'
import { generateSheets } from './generate.sheets'

export const foreignDBExtractor = () => {
  return (listener: FlatfileListener) => {
    // Step 1: Create resource setup job
    listener.on('file:created', async (event) => {
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
      async (event) => {
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
          await tick(1, 'Uploading file to S3 bucket')

          const storageResponse = await fetch(
            `${process.env.FLATFILE_API_URL}/v1/storage/upload`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.FLATFILE_API_KEY!}`,
              },
              body: JSON.stringify({
                fileId,
              }),
            }
          )
          const { arn } = await storageResponse.json()

          // Step 2: Create a Workbook
          await tick(10, 'Creating workbook')

          // Create a workbook so we can use the workbookId to name the database
          const { data: workbook } = await api.workbooks.create({
            name: `[file] ${fileName}`,
            labels: ['file'],
            spaceId,
            environmentId,
          })

          // Step 3: Restore DB from Backup
          await tick(20, 'Restoring database')
          const restoreResponse = await fetch(
            `${process.env.FLATFILE_API_URL}/v1/database/restore`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.FLATFILE_API_KEY!}`,
              },
              body: JSON.stringify({
                databaseName: workbook.id,
                arn,
              }),
            }
          )

          const { connection } = await restoreResponse.json()

          // Step 4: Create a Workbook
          // Get column names for all tables, loop through them and create Sheets for each table
          await tick(30, 'Creating workbook')
          const sheets = await generateSheets(connection)
          await api.workbooks.update(workbook.id, {
            sheets,
            metadata: {
              connectionType: 'FOREIGN_MSSQL',
              connectionConfig: connection,
            },
          })

          // Step 5: Update file with workbookId
          await tick(40, 'Updating file')
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
