import api, { Flatfile } from '@flatfile/api'
import FlatfileListener from '@flatfile/listener'
import { getFileBuffer } from '@flatfile/util-file-buffer'
import sql from 'mssql'
import { restoreDatabaseFromBackup } from './database.restore'
import { generateSheets } from './generate.sheets'
import { putInS3Bucket } from './put.s3'

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
        operation: `extract-plugin-foreign-mssql-db`,
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
      { operation: `extract-plugin-foreign-mssql-db` },
      async (event) => {
        const { spaceId, environmentId, fileId, jobId } = event.context

        try {
          const tick = async (progress: number, info?: string) => {
            return await api.jobs.ack(jobId, {
              progress,
              ...(info !== undefined && { info }),
            })
          }

          const job = await api.jobs.get(jobId)
          const { fileName } = job.data.input

          //Step 0: Get file buffer
          await tick(0, 'Retrieving file')
          const buffer = await getFileBuffer(event)

          // Step 1: Upload file to S3
          await tick(10, 'Uploading file to S3 bucket')
          const bucketName = `foreign-db-extractor-s3-bucket`
          await putInS3Bucket(bucketName, buffer, fileName)

          // Step 2: Create a Workbook
          await tick(20, 'Creating workbook')

          // Create a workbook so we can use the workbookId to name the database
          const { data: workbook } = await api.workbooks.create({
            name: `[file] ${fileName}`,
            labels: ['file'],
            spaceId,
            environmentId,
          })

          // Step 3: Restore DB from Backup
          await tick(30, 'Restoring database')
          // Connection config for hot RDS instance
          // The restore requires access to the master database
          const connectionConfig: sql.config = {
            user: process.env.FOREIGN_MSSQL_USER,
            password: process.env.FOREIGN_MSSQL_PASSWORD,
            server: process.env.FOREIGN_MSSQL_SERVER,
            database: workbook.id,
            options: { port: 1433, trustServerCertificate: true },
            connectionTimeout: 30000,
            requestTimeout: 90000,
            timeout: 15000,
          }
          const arn = `arn:aws:s3:::${bucketName}/${fileName}`
          await restoreDatabaseFromBackup(connectionConfig, arn)

          // Step 4: Create a Workbook
          // Get column names for all tables, loop through them and create Sheets for each table
          await tick(40, 'Creating workbook')
          const sheets = await generateSheets(connectionConfig)
          await api.workbooks.update(workbook.id, {
            sheets,
            metadata: {
              connectionType: 'FOREIGN_MSSQL',
              connectionConfig,
            },
          })

          // Step 5: Update file with workbookId
          await tick(50, 'Updating file')
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
