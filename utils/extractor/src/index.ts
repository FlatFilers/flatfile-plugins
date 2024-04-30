import { Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileListener } from '@flatfile/listener'
import { asyncBatch, slugify } from '@flatfile/util-common'
import { getFileBuffer } from '@flatfile/util-file-buffer'

const api = new FlatfileClient()

export const Extractor = (
  fileExt: string | RegExp,
  extractorType: string,
  parseBuffer: (
    buffer: Buffer,
    options: any
  ) => WorkbookCapture | Promise<WorkbookCapture>,
  options?: Record<string, any>
) => {
  return (listener: FlatfileListener) => {
    listener.on('file:created', async (event) => {
      const { fileId } = event.context
      const { data: file } = await api.files.get(fileId)
      if (file.mode === 'export') {
        return
      }

      if (typeof fileExt === 'string' && !file.name.endsWith(fileExt)) {
        return
      }

      if (fileExt instanceof RegExp && !fileExt.test(file.name)) {
        return
      }

      const jobs = await api.jobs.create({
        type: Flatfile.JobType.File,
        operation: `extract-plugin-${extractorType}`,
        status: Flatfile.JobStatus.Ready,
        source: fileId,
      })
      await api.jobs.execute(jobs.data.id)
    })
    listener.on(
      'job:ready',
      { operation: `extract-plugin-${extractorType}` },
      async (event) => {
        const { fileId, jobId } = event.context
        const { chunkSize, parallel, debug } = {
          chunkSize: 5_000,
          parallel: 1,
          debug: false,
          ...options,
        }

        const tick = async (progress: number, info?: string) => {
          await api.jobs.ack(jobId, { progress, info })
          if (debug) {
            console.log(`Job progress: ${progress}, Info: ${info}`)
          }
        }

        try {
          await tick(1, 'Retrieving file')
          const { data: file } = await api.files.get(fileId)
          const buffer = await getFileBuffer(event)

          await tick(3, 'Parsing Sheets')
          const capture = await parseBuffer(buffer, {
            ...options,
            fileId,
          })

          await tick(5, 'Creating workbook')
          const workbook = await createWorkbook(
            event.context.environmentId,
            file,
            capture
          )

          // Add workbook to file so if the extraction fails and the file is deleted, the workbook is also deleted
          // instead of being orphaned
          await api.files.update(file.id, {
            workbookId: workbook.id,
          })

          if (!workbook.sheets || workbook.sheets.length === 0) {
            throw new Error('No Sheets found')
          }

          await tick(10, 'Adding records to Sheets')

          let processedRecords = 0
          const totalLength = Object.values(capture).reduce(
            (acc: number, sheet: any) => acc + (sheet?.data?.length || 0),
            0
          )
          for (const sheet of workbook.sheets) {
            if (!capture[sheet.name]) {
              continue
            }
            await asyncBatch(
              capture[sheet.name].data,
              async (chunk) => {
                await api.records.insert(sheet.id, chunk, {
                  compressRequestBody: true,
                })
                processedRecords += chunk.length
                const progress = Math.min(
                  99,
                  Math.round(10 + (90 * processedRecords) / totalLength)
                )
                await tick(progress, 'Adding records to Sheets')
              },
              { chunkSize, parallel, debug }
            )
          }
          await api.files.update(file.id, {
            status: 'complete',
          })
          await api.jobs.complete(jobId, {
            info: 'Extraction complete',
            outcome: {
              message: 'Extracted file',
            },
          })
        } catch (e) {
          if (debug) {
            console.log(`Extractor error: ${e.message}`)
          }
          await api.files.update(fileId, {
            status: 'failed',
          })
          await api.jobs.fail(jobId, {
            info: 'Extraction failed',
            outcome: {
              message: e.message,
            },
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
  const { data: workbook } = await api.workbooks.create(workbookConfig)
  return workbook
}

function getWorkbookConfig(
  name: string,
  spaceId: string,
  environmentId: string,
  workbookCapture: WorkbookCapture
): Flatfile.CreateWorkbookConfig {
  const sheets = Object.entries(workbookCapture).map(([sheetName, sheet]) => {
    return getSheetConfig(sheetName, sheet)
  })

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
    slug: slugify(name),
    fields: headers.map((key) => ({
      key,
      label: key,
      description: descriptions?.[key] || '',
      type: 'string',
      constraints: required?.[key] ? [{ type: 'required' }] : [],
    })),
  }
}

/**
 * Generic structure for capturing a workbook
 */
export type WorkbookCapture = Record<string, SheetCapture>

/**
 * Generic structure for capturing a sheet
 */
export type SheetCapture = {
  headers: string[]
  required?: Record<string, boolean>
  descriptions?: Record<string, null | string> | null
  data: Flatfile.RecordData[]
}
