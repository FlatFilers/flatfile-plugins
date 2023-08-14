import type { FlatfileListener } from '@flatfile/listener'
import { fileBuffer } from '@flatfile/util-file-buffer'
import api, { Flatfile } from '@flatfile/api'
import { mapValues } from 'remeda'
import { asyncBatch } from '@flatfile/util-common'

export const Extractor = (
  fileExt: string | RegExp,
  parseBuffer: (buffer: Buffer, options: any) => WorkbookCapture,
  options?: Record<string, any>
) => {
  return (handler: FlatfileListener) => {
    handler.use(
      fileBuffer(fileExt, async (file, buffer, event) => {
        const job = await api.jobs.create({
          type: 'file',
          operation: 'extract',
          status: 'ready',
          source: event.context.fileId,
        })
        try {
          await api.jobs.update(job.data.id, { status: 'executing' })
          await api.jobs.ack(job.data.id, {
            progress: 10,
            info: 'Parsing Sheets',
          })
          const capture = parseBuffer(buffer, options)
          const workbook = await createWorkbook(
            event.context.environmentId,
            file,
            capture
          )
          await api.jobs.ack(job.data.id, {
            progress: 50,
            info: 'Adding records to Sheets',
          })
          const { chunkSize = 1000, parallel = 1 } = options
          console.log(chunkSize, parallel)
          for (const sheet of workbook.sheets) {
            if (!capture[sheet.name]) {
              continue
            }
            await asyncBatch(
              capture[sheet.name].data,
              async (chunk) => {
                await api.records.insert(sheet.id, chunk)
              },
              { chunkSize, parallel }
            )
          }
          await api.files.update(file.id, {
            workbookId: workbook.id,
          })
          await api.jobs.complete(job.data.id, {
            info: 'Extraction complete',
          })
          console.log(workbook)
        } catch (e) {
          console.log(`error ${e}`)
          await api.jobs.fail(job.data.id, {
            info: `Extraction failed ${e.message}`,
          })
        }
      })
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

  if (workbook.data.sheets.length === 0) {
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
