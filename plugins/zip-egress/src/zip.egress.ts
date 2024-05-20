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

export const zipEgressPlugin = (job, opts: PluginOptions = {}) => {
  return jobHandler(job, async (event: FlatfileEvent, tick) => {
    const { workbookId, spaceId, environmentId } = event.context
    const timestamp = new Date().toISOString()
    await tick(0, 'Preparing workbook...')

    try {
      const { data: workbook } = await api.workbooks.get(workbookId)
      const sheets = workbook.sheets.filter(
        (sheet) => !opts.excludedSheets?.includes(sheet.config.slug)
      )

      const zip = new AdmZip()
      let i = 0
      for (const sheet of sheets) {
        const { fields } = sheet.config
        const columns: ColumnOption[] = []
        fields.forEach((field) => {
          if (!!field.metadata?.excludeFromExport) return
          columns.push({ key: field.key, header: field.label })
        })

        const csvFilePath = path.join(
          '/tmp',
          `${sheet.config.slug}-${timestamp}.csv`
        )
        fs.closeSync(fs.openSync(csvFilePath, 'w'))
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

            if (pageNumber === 1 && records?.length === 0) {
              const emptyRecord = fields.reduce(
                (acc, { key }) => ({ ...acc, [key]: '' }),
                {}
              )
              normalizedRecords = [emptyRecord]
            }
            const rows = stringify(normalizedRecords, {
              header: pageNumber === 1,
              columns: columns,
              cast: { boolean: castBoolean },
            })

            await fs.promises.appendFile(csvFilePath, rows)
          },
          opts.getRecordsRequest
        )

        zip.addLocalFile(csvFilePath)

        await tick(
          10 + Math.round(((i + 1) / sheets.length) * 70),
          `${sheet.name} Prepared`
        )
        await fs.promises.unlink(csvFilePath)
        i++
      }

      await tick(81, `Uploading file...`)

      const zipFilePath = path.join('/tmp', `${workbook.name}-${timestamp}.zip`)
      zip.writeZip(zipFilePath)
      const stream = fs.createReadStream(zipFilePath)

      await api.files.upload(stream, {
        spaceId,
        environmentId,
        mode: 'export',
      })

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

export interface PluginOptions {
  readonly excludedSheets?: string[]
  readonly getRecordsRequest?: Flatfile.GetRecordsRequest
  readonly debug?: boolean
}
