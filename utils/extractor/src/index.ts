import { Flatfile, FlatfileClient } from '@flatfile/api'
import type { FlatfileListener } from '@flatfile/listener'
import { asyncBatch, slugify } from '@flatfile/util-common'
import { getFileBuffer } from '@flatfile/util-file-buffer'

const api = new FlatfileClient()

/**
 * @description Is called with a `FlatfileListener` and performs extraction of data
 * from a file based on options passed as an argument, and adds records to Sheets
 * based on the extracted data.
 * 
 * @param {string | RegExp} fileExt - file extension of the files to be extracted,
 * which is used to filter out files that do not have the specified extension.
 * 
 * @param {string} extractorType - type of extractor to use for the extraction task,
 * and it is used to determine the appropriate parsing logic for the file contents.
 * 
 * @param {(
 *     buffer: Buffer,
 *     options: any
 *   ) => WorkbookCapture | Promise<WorkbookCapture>} parseBuffer - result of the
 * `getFileBuffer` function, which is a buffer containing the file's contents, and
 * it is passed to the `parseBuffer` function for extraction and formatting into a
 * WorkbookCapture object.
 * 
 * @param {Record<string, any>} options - configuration for the extractor type,
 * including the chunk size, parallelism, and debugging options.
 * 
 * @returns {WorkbookCapture} a promise that resolves to a WorkbookCapture object.
 * 
 * 	* `jobId`: The unique identifier for the job that was executed.
 * 	* `fileId`: The unique identifier for the file that was processed.
 * 	* `spaceId`: The unique identifier for the space in which the file was uploaded.
 * 	* `chunkSize`: The size of each chunk of data that was processed, in bytes.
 * 	* `parallel`: The number of parallel executions that were performed for the job.
 * 	* `debug`: A boolean indicating whether debug information was logged during the
 * execution of the job.
 * 	* `operation`: The name of the operation that was executed (in this case, "extract-plugin-<extractor_type>").
 * 	* `status`: The outcome of the job (either "ready" or "complete"), and any
 * additional information that may be useful in understanding the outcome.
 * 	* `workbookId`: The unique identifier for the workbook that was created during
 * the execution of the job.
 * 	* `capture`: An object containing the parsed data from the file, with the keys
 * being the names of the sheets in the workbook and the values being objects
 * representing the data in each sheet.
 * 
 * 	Note that the output does not include any information about the extracted records,
 * as this is handled separately in the `asyncBatch` function.
 */
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
        const { fileId, jobId, spaceId } = event.context
        const { chunkSize, parallel, debug } = {
          chunkSize: 5_000,
          parallel: 1,
          debug: false,
          ...options,
        }

        /**
         * @description Acks a job with the specified `jobId` using the `api.jobs.ack()`
         * method and logs the progress and any additional information to the console if the
         * `debug` variable is true.
         * 
         * @param {number} progress - 0 to 1 estimate of the job's completion progress, which
         * is passed as an object containing the `progress` and optional `info` properties
         * to the `ack` method of the `api.jobs` module for acknowledging the job's completion
         * status.
         * 
         * @param {string} info - additional data to include with the acknowledgement of the
         * job in the `jobs.ack()` method, if any.
         */
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

          const { data: entitlements } = await api.entitlements.list({
            resourceId: spaceId,
          })
          const headerSelectionEnabled = !!entitlements.find(
            (e) => e.key === 'headerSelection'
          )

          await tick(3, 'Parsing Sheets')
          const capture = await parseBuffer(buffer, {
            ...options,
            fileId,
            headerSelectionEnabled,
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

          // After all records are added, update the sheet metadata
          if (headerSelectionEnabled) {
            await updateSheetMetadata(workbook, capture)
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

/**
 * @description Creates a new Flatfile workbook based on configuration parameters and
 * stores it in the specified environment using the Flatfile API.
 * 
 * @param {string} environmentId - Id of an environment where the new workbook will
 * be created.
 * 
 * @param {Flatfile.File_} file - file that will be used to create a new workbook in
 * Flatfile.
 * 
 * @param {WorkbookCapture} workbookCapture - capturing settings for the created
 * workbook, providing the necessary information to generate high-quality documentation.
 * 
 * @returns {Promise<Flatfile.Workbook>} a Flatfile.Workbook object.
 */
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

/**
 * @description Takes a workbook capture, names, and environments as input to create
 * a Flatfile workbook configuration object containing sheet configurations.
 * 
 * @param {string} name - name of the workbook being created.
 * 
 * @param {string} spaceId - identifier of the space where the workbook will be created.
 * 
 * @param {string} environmentId - identifier of the environment to which the workbook
 * belongs.
 * 
 * @param {WorkbookCapture} workbookCapture - WorkbookCapture object that contains
 * information about the Excel workbook to be generated, including sheet data.
 * 
 * @returns {Flatfile.CreateWorkbookConfig} a Flatfile.CreateWorkbookConfig object
 * containing the name of the workbook, labels, space ID, environment ID, and sheets.
 */
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

/**
 * @description Generates a Flatfile sheet configuration object from input parameters
 * `name`, `headers`, `required`, and `descriptions`. The output includes the sheet
 * name, slug, fields with their corresponding keys, required status, and descriptions.
 * 
 * @param {string} name - name of the sheet for which the configuration is being generated.
 * 
 * @param {SheetCapture} .headers - header row of the sheet as an array of field
 * names, which are used to generate the `fields` property of the output `Flatfile.SheetConfig`.
 * 
 * @param {SheetCapture} .required - requirement for each field in the sheet's configuration.
 * 
 * @param {SheetCapture} .descriptions - optional field-level descriptions for the
 * given fields
 * 
 * @returns {Flatfile.SheetConfig} a `Flatfile.SheetConfig` object containing the
 * specified sheet's configuration information.
 */
function getSheetConfig(
  name: string,
  { headers, required, descriptions }: SheetCapture
): Flatfile.SheetConfig {
  return {
    name,
    slug: slugify(name),
    fields: keysToFields({ keys: headers, required, descriptions }),
  }
}

/**
 * @description Reduces an array of keys to a Flatfile schema with `string` fields
 * and constraints based on the input `required` and `descriptions`.
 * 
 * @param {string[]} .keys - array of field keys for which to generate corresponding
 * property objects in the output.
 * 
 * @param {Record<string, boolean>} .required - requirement for a particular field
 * and specifies whether it is mandatory or optional by defining a truthy or falsy
 * value for each field key.
 * 
 * @param {Record<string, string>} .descriptions - metadata associated with each key,
 * which can include a description of what the field represents.
 * 
 * @returns {Flatfile.Property[]} an array of Flatfile.Property objects, each
 * representing a key with its label, description, type, and constraints.
 */
export function keysToFields({
  keys,
  required = {},
  descriptions = {},
}: {
  keys: string[]
  required?: Record<string, boolean>
  descriptions?: Record<string, string>
}): Flatfile.Property[] {
  let index = 0
  const countOfKeys: Record<
    string,
    { count: number; index: number; metadata?: { fieldRef: string } }
  > = keys.reduce((acc, key) => {
    if (!key) key = ''
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
      key,
      label: key,
      description: descriptions?.[key] || '',
      type: 'string',
      constraints: required?.[key] ? [{ type: 'required' }] : [],
    }))
}

/**
 * @description Updates the metadata for a worksheet within a Google Sheets document
 * by leveraging the Flatfile library to retrieve the metadata and then utilizing the
 * Google Sheets API to update it.
 * 
 * @param {Flatfile.Workbook} workbook - Flutter file containing the metadata to be
 * updated.
 * 
 * @param {WorkbookCapture} workbookCapture - metadata for each sheet in the workbook,
 * which is used to update the metadata for each sheet in the workbook through the
 * API call made by the `updateSheet()` method.
 * 
 * @returns {Promise<void>} void.
 */
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
  required?: Record<string, boolean>
  descriptions?: Record<string, null | string> | null
  data: Flatfile.RecordData[]
  metadata?: { rowHeaders: number[] }
}
