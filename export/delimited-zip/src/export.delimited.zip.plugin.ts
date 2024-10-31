import { FlatfileClient } from '@flatfile/api'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { processRecords } from '@flatfile/util-common'
import AdmZip from 'adm-zip'
import { stringify } from 'csv-stringify/sync'
import fs from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const api = new FlatfileClient()

export interface PluginOptions {
  job: string
  delimiter: string
  fileExtension: string
  debug?: boolean
}

export function exportDelimitedZip(options: PluginOptions) {
  return jobHandler(`workbook:${options.job}`, async (event, tick) => {
    const { workbookId, spaceId, environmentId } = event.context

    try {
      const { data: workbook } = await api.workbooks.get(workbookId)

      await tick(1, `Starting ${workbook.name} export`)

      const { data: sheets } = await api.sheets.list({ workbookId })
      if (options.debug) {
        console.log('Sheets retrieved:', sheets)
      }

      // Get current date-time
      const dateTime = new Date().toISOString().replace(/[:.]/g, '-')

      // Get the path to the system's temporary directory
      const tempDir = tmpdir()

      const sanitizeFileName = (name: string) =>
        path.basename(
          name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_')
        )
      const sanitizedWorkbookName = sanitizeFileName(workbook.name)

      // Create a new directory in the system's temporary directory for the delimited files
      const dir = path.join(tempDir, `${sanitizedWorkbookName}_${dateTime}`)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }

      if (options.debug) {
        console.log(`Creating zip file in ${dir}`)
      }

      const zipFile = new AdmZip()

      // For each sheet, create a delimited file and populate it with data
      const totalSheets = sheets.length
      for (const [index, sheet] of sheets.entries()) {
        // Limit sheet name to 31 characters
        const trimmedSheetName = sanitizeFileName(sheet.name).substring(0, 31)

        if (options.debug) {
          console.log(`Processing sheet ${trimmedSheetName}`)
        }

        const {
          data: {
            config: { fields },
          },
        } = await api.sheets.get(sheet.id)

        const header = fields.map((field) => field.key)
        const headerLabels = fields.map((field) => field.label)

        const fileName = `${trimmedSheetName}.${options.fileExtension}`
        const filePath = `${dir}/${fileName}`

        // Write header only once before processing records
        const headerContent = stringify([headerLabels], {
          delimiter: options.delimiter,
        })
        fs.writeFileSync(filePath, headerContent)

        if (options.debug) {
          console.log(`Writing header to ${filePath}`)
        }

        await processRecords(
          sheet.id,
          async (records, pageNumber, totalPageCount) => {
            const rows = records.map((record) =>
              header.map((key) => record.values[key].value)
            )

            const csvContent = stringify(rows, {
              delimiter: options.delimiter,
            })

            // Append the new records to the existing file
            fs.appendFileSync(filePath, csvContent)

            if (options.debug) {
              console.log(
                `Writing ${records.length} records to ${filePath} (page ${pageNumber} of ${totalPageCount})`
              )
            }

            // Calculate progress percentage
            const sheetProgress = (pageNumber + 1) / totalPageCount
            const sheetWeight = 1 / totalSheets
            const progress = Math.round(
              (index / totalSheets + sheetProgress * sheetWeight) * 80 + 10
            )

            // Acknowledge job progress
            await tick(
              progress,
              `Processed page ${pageNumber + 1} of ${trimmedSheetName}.${options.fileExtension}`
            )
          },
          {
            pageSize: 5,
          }
        )

        zipFile.addFile(fileName, fs.readFileSync(filePath))
      }

      if (options.debug) {
        console.log(
          `Data written to ${options.fileExtension.toUpperCase()} files`
        )
      }

      const zipFileName = `${sanitizedWorkbookName}_${dateTime}.zip`
      const zipFilePath = path.join(tempDir, zipFileName)

      zipFile.writeZip(zipFilePath)

      if (options.debug) {
        console.log(`Zipped file: ${zipFilePath}`)
      }

      const { data: file } = await api.files.upload(
        fs.createReadStream(zipFilePath),
        {
          spaceId,
          environmentId,
          mode: 'export',
        }
      )

      // Cleanup temporary files
      for (const sheet of workbook.sheets) {
        const trimmedSheetName = sanitizeFileName(sheet.name).substring(0, 31)
        const fileName = `${trimmedSheetName}.${options.fileExtension}`
        const filePath = path.join(dir, fileName)

        try {
          await fs.promises.unlink(filePath)
          if (options.debug) {
            console.log(`Deleted temporary file: ${filePath}`)
          }
        } catch (error) {
          console.warn(`Failed to delete temporary file: ${filePath}`, error)
        }
      }

      try {
        await fs.promises.unlink(zipFilePath)
        if (options.debug) {
          console.log(`Deleted temporary ZIP file: ${zipFilePath}`)
        }
      } catch (error) {
        console.warn(
          `Failed to delete temporary ZIP file: ${zipFilePath}`,
          error
        )
      }

      return {
        outcome: {
          message: `Data was exported to ${zipFileName}.`,
          next: {
            type: 'files',
            files: [{ fileId: file.id }],
          },
        },
      }
    } catch (error) {
      if (options.debug) {
        console.error(error)
      }

      throw new Error(
        `This job failed probably because it couldn't write to the ${options.fileExtension.toUpperCase()} files, compress them into a ZIP file, or upload it.`
      )
    }
  })
}
