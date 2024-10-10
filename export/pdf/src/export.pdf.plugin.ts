import api from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import * as fs from 'fs'
import { generatePDFReport } from './export.pdf.generate'

export function exportPDF() {
  return function (listener: FlatfileListener) {
    listener.use(
      jobHandler('sheet:generatePDFReport', async (event: FlatfileEvent) => {
        const { sheetId, spaceId, environmentId } = event.context

        if (!sheetId) {
          throw new Error('Sheet ID is missing from the event context')
        }

        const { data: records } = await api.records.get(sheetId, {
          pageSize: 50,
        })

        const pdfBytes = await generatePDFReport(records.records, event)

        const fileName = `report_${sheetId}_${Date.now()}.pdf`

        const tempFilePath = `/tmp/${fileName}`
        fs.writeFileSync(tempFilePath, Buffer.from(pdfBytes))
        const fileStream = fs.createReadStream(tempFilePath)

        try {
          await api.files.upload(fileStream, {
            spaceId,
            environmentId,
          })
          fs.unlinkSync(tempFilePath)

          return {
            info: 'PDF report generated',
          }
        } catch (error) {
          fs.unlinkSync(tempFilePath)
          console.error('Failed to upload PDF report', error)
          throw new Error('Failed to upload PDF report')
        }
      })
    )
  }
}
