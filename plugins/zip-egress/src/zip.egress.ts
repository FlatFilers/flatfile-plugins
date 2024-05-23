import type { Flatfile } from '@flatfile/api'
import api from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { processRecords } from '@flatfile/util-common'
import AdmZip from 'adm-zip'
import { ColumnOption, stringify } from 'csv-stringify/sync'
import fs from 'fs'
import path from 'path'
import { castBoolean } from './utils'

/**
 * Plugin function for exporting a workbook as a ZIP file.
 * @param job - The job object.
 * @param opts - Plugin options.
 * @returns A job handler function.
 */
export const zipEgressPlugin = (job, opts: PluginOptions = {}) => {
  return jobHandler(job, async (event: FlatfileEvent, tick) => {
    const { workbookId, spaceId, environmentId } = event.context
    const timestamp = new Date().toISOString()
    await tick(0, 'Preparing workbook...')

    try {
      // Get the workbook details
      const { data: workbook } = await api.workbooks.get(workbookId)
      // Filter out excluded sheets based on the provided options
      const sheets = workbook.sheets.filter(
        (sheet) => !opts.excludedSheets?.includes(sheet.config.slug)
      )

      const zip = new AdmZip()
      let i = 0
      for (const sheet of sheets) {
        const { fields } = sheet.config
        const columns: ColumnOption[] = []
        // Prepare the columns for CSV export, excluding fields marked as excludeFromExport
        fields.forEach((field) => {
          if (!!field.metadata?.excludeFromExport) return
          columns.push({ key: field.key, header: field.label })
        })

        // Create a temporary CSV file for the sheet
        const csvFilePath = path.join(
          '/tmp',
          `${sheet.config.slug}-${timestamp}.csv`
        )
        fs.closeSync(fs.openSync(csvFilePath, 'w'))
        // Process records and write them to the CSV file
        await processRecords(
          sheet.id,
          async (records, pageNumber) => {
            let normalizedRecords = records.map(({ values }) => {
              const result = fields.reduce((acc, { key }) => {
                acc[key] = values[key] ? values[key].value : ''
                return acc
              }, {})
              return result
            })

            // Handle empty records for the first page by creating an empty record with all fields
            if (pageNumber === 1 && records?.length === 0) {
              const emptyRecord = fields.reduce(
                (acc, { key }) => ({ ...acc, [key]: '' }),
                {}
              )
              normalizedRecords = [emptyRecord]
            }
            // Stringify the records and append them to the CSV file
            const rows = stringify(normalizedRecords, {
              header: pageNumber === 1,
              columns: columns,
              cast: { boolean: castBoolean },
            })

            await fs.promises.appendFile(csvFilePath, rows)
          },
          opts.getRecordsRequest
        )

        // Add the CSV file to the ZIP archive
        zip.addLocalFile(csvFilePath)

        await tick(
          10 + Math.round(((i + 1) / sheets.length) * 70),
          `${sheet.name} Prepared`
        )
        // Clean up the temporary CSV file
        await fs.promises.unlink(csvFilePath)
        i++
      }

      await tick(81, `Uploading file...`)

      // Create the ZIP file
      const zipFilePath = path.join('/tmp', `${workbook.name}-${timestamp}.zip`)
      zip.writeZip(zipFilePath)
      const stream = fs.createReadStream(zipFilePath)

      // Upload the ZIP file to Flatfile
      await api.files.upload(stream, {
        spaceId,
        environmentId,
        mode: 'export',
      })

      // Clean up the temporary ZIP file
      await fs.promises.unlink(zipFilePath)

      return {
        outcome: {
          acknowledge: true,
          message: 'Successfully exported workbook',
          next: {
            type: 'id',
            id: spaceId,
            path: 'files',
            query: 'mode=export',
            label: 'See all downloads',
          },
        },
      }
    } catch (error) {
      console.error(error)
      throw new Error('Failed to export workbook')
    }
  })
}

/**
 * Options for the zipEgressPlugin.
 */
export interface PluginOptions {
  /**
   * Array of sheet slugs to exclude from the export.
   */
  readonly excludedSheets?: string[]
  /**
   * Additional options for the getRecords request.
   */
  readonly getRecordsRequest?: Flatfile.GetRecordsRequest
  /**
   * Enables debug mode.
   */
  readonly debug?: boolean
}
