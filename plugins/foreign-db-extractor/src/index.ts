import api, { Flatfile } from '@flatfile/api'
import FlatfileListener from '@flatfile/listener'
import { getFileBuffer } from '@flatfile/util-file-buffer'
import sql from 'mssql'
import {
  generateSheets,
  getTablesAndColumns,
  restoreDatabaseFromBackup,
} from './restore.database'
import { createResources } from './setup.resources'

export const foreignDBExtractor = () => {
  return (listener: FlatfileListener) => {
    // Step 1: Create resource setup job
    listener.on('file:created', async (event) => {
      const { data: file } = await api.files.get(event.context.fileId)
      if (file.mode === 'export') {
        return false
      }

      // Filter on MSSQL backup file type
      if (!file.name.endsWith('.bak')) {
        return false
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

          await tick(0, 'Retrieving file')
          const buffer = await getFileBuffer(event)

          // Step 1: Create AWS resources
          const { server, port, bucketName, user, password } =
            await createResources(buffer, fileName, tick)

          const database = fileName.replace('.bak', '')
          const connectionConfig: sql.config = {
            user,
            password,
            server,
            database,
            options: {
              port,
              trustServerCertificate: true,
            },
            connectionTimeout: 30_000,
            requestTimeout: 90_000,
            timeout: 15_000,
          }
          const arn = `arn:aws:s3:::${bucketName}/${fileName}`
          await tick(50, 'Starting Database Restore')

          // Step 2: Restore DB from Backup
          await restoreDatabaseFromBackup(connectionConfig, arn)
          await tick(55, 'Restored DB from backup')

          // Step 3: Create a Workbook
          // Get column names for all tables, loop through them and create Sheets for each table
          await tick(65, 'Creating workbook')
          const tables = await getTablesAndColumns(connectionConfig)
          const sheets = generateSheets(tables)
          const { data: workbook } = await api.workbooks.create({
            name: `[file] ${database}`,
            labels: ['file'],
            spaceId,
            environmentId,
            sheets,
            metadata: {
              connectionType: 'FOREIGN_MSSQL',
              connectionConfig,
            },
          })
          await tick(70, 'Created workbook')

          await tick(95, 'Wrapping up')
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
