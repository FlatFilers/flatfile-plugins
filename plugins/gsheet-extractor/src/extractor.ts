import api, { Flatfile } from '@flatfile/api'
import { JobStatus, JobType } from '@flatfile/api/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { asyncBatch } from '@flatfile/util-common'
import { SheetCapture, WorkbookCapture } from '@flatfile/util-extractor'
import { getFileBuffer } from '@flatfile/util-file-buffer'
import { mapValues } from 'remeda'

type Config = {
  sheetRange: Record<string, string>
}

/**
 * File extractor, adapted heavily from flatfile extractor plugin.
 *
 * Main differences:
 * - parseBuffer is async
 * - get google cloud service account secrets from flatfile
 */
export const Extractor = (
  fileExt: string | RegExp,
  parseBuffer: (
    buffer: Buffer,
    options: Config & {
      getSecret: (key: string) => Promise<string>
    },
  ) => Promise<WorkbookCapture>,
  config: Config,
) => {
  return (listener: FlatfileListener) => {
    listener.on('file:created', async (event) => {
      const { data: file } = await api.files.get(event.context.fileId)
      if (file.mode === 'export') return false

      if (typeof fileExt === 'string' && !file.name.endsWith(fileExt)) {
        return false
      }

      if (fileExt instanceof RegExp && !fileExt.test(file.name)) return false

      const jobs = await api.jobs.create({
        type: JobType.File,
        operation: `extract-plugin-gsheet`,
        status: JobStatus.Ready,
        source: event.context.fileId,
      })

      await api.jobs.execute(jobs.data.id)
    })

    listener.on(
      'job:ready',
      { operation: `extract-plugin-gsheet` },
      async (event) => {
        const { data: file } = await api.files.get(event.context.fileId)

        const buffer = await getFileBuffer(event)

        const { jobId } = event.context

        try {
          await api.jobs.ack(jobId, { progress: 3, info: 'Parsing Sheets' })

          const capture = await parseBuffer(buffer, {
            ...config,
            getSecret: (key: string) => event.secrets(key),
          })

          const workbook = await createWorkbook(
            event.context.environmentId,
            file,
            capture
          )

          await api.jobs.ack(jobId, {
            progress: 10,
            info: 'Adding records to Sheets',
          })

          let processedRecords = 0

          const totalLength = Object.values(capture).reduce(
            (
              acc: number,
              sheet: {
                data: unknown[]
              }
            ) => acc + (sheet?.data?.length || 0),
            0
          )

          for (const sheet of workbook.sheets) {
            if (!capture[sheet.name]) continue

            await asyncBatch(
              capture[sheet.name].data,
              async (chunk) => {
                await api.records.insert(sheet.id, chunk)

                processedRecords += chunk.length

                const progress = Math.min(
                  99,
                  Math.round(10 + (90 * processedRecords) / totalLength)
                )

                await api.jobs.ack(jobId, {
                  progress,
                  info: 'Adding records to Sheets',
                })
              },
              { chunkSize: 10000, parallel: 1, debug: false }
            )
          }

          await api.files.update(file.id, {
            workbookId: workbook.id,
          })

          await api.jobs.complete(jobId, {
            info: 'Extraction complete',
            outcome: {
              message: 'Extracted file',
            },
          })
        } catch (error) {
          console.error(error.message)

          await api.jobs.fail(jobId, {
            info: `Extraction failed ${error.message}`,
          })
        }
      }
    )
  }
}

async function createWorkbook(
  environmentId: string,
  file: Flatfile.File_,
  workbookCapture: WorkbookCapture
): Promise<Flatfile.Workbook> {
  const workbookConfig = getWorkbookConfig(
    file.name,
    file.spaceId,
    environmentId,
    workbookCapture
  )
  const workbook = await api.workbooks.create(workbookConfig)

  if (!workbook.data.sheets || workbook.data.sheets.length === 0) {
    throw new Error('No sheets found')
  }

  return workbook.data
}

function getWorkbookConfig(
  name: string,
  spaceId: string,
  environmentId: string,
  workbookCapture: WorkbookCapture
): Flatfile.CreateWorkbookConfig {
  const sheets = Object.values(
    mapValues(workbookCapture, (sheet, sheetName) => {
      return getSheetConfig(sheetName, sheet)
    })
  )

  return {
    name: `[file] ${name}`,
    labels: ['file'],
    spaceId,
    environmentId,
    sheets,
  }
}

function getSheetConfig(
  name: string,
  { headers, required, descriptions }: SheetCapture
): Flatfile.SheetConfig {
  return {
    name,
    fields: headers.map((key) => ({
      key,
      label: key,
      description: descriptions?.[key] || '',
      type: 'string',
      constraints: required?.[key] ? [{ type: 'required' }] : [],
    })),
  }
}
