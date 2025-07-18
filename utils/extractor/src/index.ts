import { Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileListener } from '@flatfile/listener'
import { createAllRecords, slugify } from '@flatfile/util-common'
import { getFileBuffer } from '@flatfile/util-file-buffer'
const api = new FlatfileClient()

const WORKBOOK_CREATION_DELAY = 3_000

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
      const { fileId, spaceId } = event.context
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
        const { fileId, jobId, spaceId } = event.context
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
          await tick(1, 'plugins.extraction.retrieveFile')
          const { data: file } = await api.files.get(fileId)

          const { data: entitlements } = await api.entitlements.list({
            resourceId: spaceId,
          })
          const headerSelectionEnabled = !!entitlements.find(
            (e) => e.key === 'headerSelection'
          )

          const sourceEditorEnabled = !!entitlements.find(
            (e) => e.key === 'sourceEditor'
          )

          const buffer = await getFileBuffer(event)

          // inject the getHeaders function into the options
          const getHeaders = async (options: any, data: string[][]) => {
            try {
              const { data: headers } = await api.files.detectHeader({
                options: {
                  ...options,
                },
                data,
              })
              return headers
            } catch (e) {
              console.dir(e, { depth: null })
              return { skip: 0, header: [] }
            }
          }

          await tick(3, 'plugins.extraction.parseSheets')
          const capture = await parseBuffer(buffer, {
            ...options,
            fileId,
            fileExt: file.ext,
            headerSelectionEnabled,
            getHeaders,
          })

          await tick(5, 'plugins.extraction.createWorkbook')
          const workbook = await createWorkbook(
            event.context.environmentId,
            file,
            capture,
            sourceEditorEnabled
          )

          // Add workbook to file so if the extraction fails and the file is deleted, the workbook is also deleted
          // instead of being orphaned
          await api.files.update(file.id, {
            workbookId: workbook.id,
          })

          if (!workbook.sheets || workbook.sheets.length === 0) {
            throw new Error('plugins.extraction.noSheets')
          }

          await tick(10, 'plugins.extraction.addingRecords')

          await new Promise((resolve) => {
            setTimeout(resolve, WORKBOOK_CREATION_DELAY)
          })

          for (const sheet of workbook.sheets) {
            if (!capture[sheet.name]) {
              continue
            }
            await createAllRecords(
              sheet.id,
              capture[sheet.name].data.map(normalizeRecordKeys),
              async (_progress, part, totalParts) => {
                await tick(
                  Math.min(99, Math.round(10 + 90 * (part / totalParts))),
                  'plugins.extraction.addingRecords'
                )
              }
            )
          }

          // After all records are added, update the sheet metadata
          if (headerSelectionEnabled) {
            await updateSheetMetadata(workbook, capture)
          }

          await api.files.update(file.id, {
            status: 'complete',
          })
          await api.jobs.complete(jobId, {
            info: 'files.uploadFile.popovers.extractionCompleted',
            outcome: {
              message: 'plugins.extraction.extractedFile',
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
            info: 'plugins.extraction.extractionFailed',
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
  workbookCapture: WorkbookCapture,
  sourceEditorEnabled: boolean
): Promise<Flatfile.Workbook> {
  const workbookConfig = getWorkbookConfig(
    file.name,
    file.spaceId,
    environmentId,
    workbookCapture,
    sourceEditorEnabled
  )
  const { data: workbook } = await api.workbooks.create(workbookConfig)
  return workbook
}

function getWorkbookConfig(
  name: string,
  spaceId: string,
  environmentId: string,
  workbookCapture: WorkbookCapture,
  sourceEditorEnabled: boolean
): Flatfile.CreateWorkbookConfig {
  const sheets = Object.entries(workbookCapture).map(([sheetName, sheet]) => {
    return getSheetConfig(sheetName, sheet, sourceEditorEnabled)
  })

  return {
    name: `[file] ${name}`,
    labels: ['file'], // we use this on the backend to add the EXTRACTED_FROM_SOURCE treatment to the workbook on previous versions of the plugin
    spaceId,
    environmentId,
    sheets,
    treatments: [Flatfile.WorkbookTreatments.ExtractedFromSource],
  }
}

function getSheetConfig(
  name: string,
  { headers, descriptions }: SheetCapture,
  sourceEditorEnabled: boolean
): Flatfile.SheetConfig {
  return {
    name,
    slug: slugify(name),
    fields: keysToFields({ keys: headers, descriptions }),
    allowAdditionalFields: sourceEditorEnabled,
  }
}

function normalizeKey(key: string): string {
  return key.trim().replace(/%/g, '_PERCENT_').replace(/\$/g, '_DOLLAR_')
}

function normalizeRecordKeys(record: Flatfile.RecordData): Flatfile.RecordData {
  const normalizedRecord = {} as Flatfile.RecordData
  for (const key in record) {
    if (record.hasOwnProperty(key)) {
      normalizedRecord[normalizeKey(key)] = record[key]
    }
  }
  return normalizedRecord
}

export function keysToFields({
  keys,
  descriptions = {},
}: {
  keys: string[]
  descriptions?: Record<string, string>
}): Flatfile.Property[] {
  let index = 0
  const countOfKeys: Record<
    string,
    { count: number; index: number; metadata?: { fieldRef: string } }
  > = keys.reduce((acc, key) => {
    if (!key) key = ''
    if (typeof key !== 'string') {
      key = String(key)
    }
    key = key.trim()
    if (key === '') {
      key = 'empty'
    }
    if (acc[key]) {
      const incrementKey = `${key}_${acc[key].count}`
      acc[incrementKey] = { count: 1, index }
      acc[key].count++
    } else {
      acc[key] = { count: 1, index }
    }
    index++
    return acc
  }, {})
  return Object.entries(countOfKeys)
    .sort((a, b) => a[1].index - b[1].index)
    .map(([key, _]) => ({
      key: normalizeKey(key),
      label: key,
      description: descriptions?.[key] || '',
      type: 'string',
    }))
}

async function updateSheetMetadata(
  workbook: Flatfile.Workbook,
  workbookCapture: WorkbookCapture
): Promise<void> {
  await Promise.all(
    workbook.sheets.map(async (sheet) => {
      const { metadata } = workbookCapture[sheet.name]
      await api.sheets.updateSheet(sheet.id, {
        metadata,
      })
    })
  )
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
  descriptions?: Record<string, null | string> | null
  data: Flatfile.RecordData[]
  metadata?: { rowHeaders: number[] }
}
