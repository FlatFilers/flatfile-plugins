import type { FlatfileListener } from '@flatfile/listener'
import { fileBuffer } from '@flatfile/util-file-buffer'
import { SheetCapture, WorkbookCapture, parseBuffer } from './parser'
import api, { Flatfile } from '@flatfile/api'
import { mapValues } from 'remeda'

export const JSONExtractor = () => {
  return (handler: FlatfileListener) => {
    handler.use(
      fileBuffer('.json', async (file, buffer, event) => {
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
          const capture = parseBuffer(buffer)
          const workbook = await createWorkbook(
            event.context.environmentId,
            file,
            capture
          )
          await api.jobs.ack(job.data.id, {
            progress: 50,
            info: 'Adding records to Sheets',
          })
          for (const sheet of workbook.sheets) {
            if (!capture[sheet.name]) {
              continue
            }
            await asyncBatch(
              capture[sheet.name].data,
              async (chunk) => {
                await api.records.insert(sheet.id, chunk)
              },
              { chunkSize: 10000, parallel: 1 }
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

async function asyncBatch<T, R>(
  arr: T[],
  callback: (chunk: T[]) => Promise<R>,
  options: { chunkSize?: number; parallel?: number } = {}
): Promise<R> {
  const { chunkSize, parallel } = { chunkSize: 1000, parallel: 1, ...options }
  const results: R[] = []

  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }

  async function processChunk(chunk: T[]): Promise<void> {
    const result = await callback(chunk)
    results.push(result)
  }

  const promises: Promise<void>[] = []
  let running = 0
  let currentIndex = 0

  function processNext(): void {
    if (currentIndex >= chunks.length) {
      return
    }

    const currentChunk = chunks[currentIndex]
    const promise = processChunk(currentChunk).finally(() => {
      running--
      processNext()
    })

    promises.push(promise)
    currentIndex++
    running++

    if (running < parallel) {
      processNext()
    }
  }

  for (let i = 0; i < parallel && i < chunks.length; i++) {
    processNext()
  }

  await Promise.all(promises)

  return results.flat() as R
}
