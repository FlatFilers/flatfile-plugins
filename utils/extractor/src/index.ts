import api, { Flatfile } from '@flatfile/api'
import { JobStatus, JobType } from '@flatfile/api/api'
import type { FlatfileListener } from '@flatfile/listener'
import { asyncBatch } from '@flatfile/util-common'
import { getFileBuffer } from '@flatfile/util-file-buffer'
import { mapValues } from 'remeda'

export const Extractor = (
  fileExt: string | RegExp,
  extractorType: string,
  parseBuffer: (buffer: Buffer, options: any) => WorkbookCapture,
  options?: Record<string, any>
) => {
  return (listener: FlatfileListener) => {
    listener.on('file:created', async (event) => {
      const { data: file } = await api.files.get(event.context.fileId)
      if (file.mode === 'export') {
        return false
      }

      if (typeof fileExt === 'string' && !file.name.endsWith(fileExt)) {
        return false
      }

      if (fileExt instanceof RegExp && !fileExt.test(file.name)) {
        return false
      }

      const jobs = await api.jobs.create({
        type: JobType.File,
        operation: `extract-plugin-${extractorType}`,
        status: JobStatus.Ready,
        source: event.context.fileId,
      })
      await api.jobs.execute(jobs.data.id)
    })
    listener.on(
      'job:ready',
      { operation: `extract-plugin-${extractorType}` },
      async (event) => {
        const { chunkSize, parallel, debug } = {
          chunkSize: 3000,
          parallel: 1,
          debug: false,
          ...options,
        }

        const { data: file } = await api.files.get(event.context.fileId)
        const buffer = await getFileBuffer(event)
        const { jobId } = event.context
        try {
          const tick = async (progress: number, info: string) => {
            await api.jobs.ack(jobId, { progress, info })
            if (debug) {
              console.log(`Job progress: ${progress}, Info: ${info}`)
            }
          }

          await tick(10, 'Parsing Sheets')
          const capture = parseBuffer(buffer, options)
          const workbook = await createWorkbook(
            event.context.environmentId,
            file,
            capture
          )
          if (!workbook.sheets || workbook.sheets.length === 0) {
            throw new Error('because no Sheets found')
          }
          await tick(50, 'Adding records to Sheets')

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
                await api.records.insert(sheet.id, chunk)
                processedRecords += chunk.length
                const progress = Math.min(
                  99,
                  Math.round(50 + (50 * processedRecords) / totalLength)
                )
                await tick(progress, 'Adding records to Sheets')
              },
              { chunkSize, parallel, debug }
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
          console.log(workbook)
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
    throw new Error('because no Sheets found')
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
