import { FlatfileClient } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logError } from '@flatfile/util-common'
import * as fs from 'fs'
import { Color, PDFDocument, PDFFont, rgb, StandardFonts } from 'pdf-lib'

const api = new FlatfileClient()

interface ReportStyle {
  primaryColor: Color
  secondaryColor: Color
  fontFamily: StandardFonts
  fontSize: {
    title: number
    heading: number
    subheading: number
    body: number
  }
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

const defaultStyle: ReportStyle = {
  primaryColor: rgb(0, 0.3, 0.7),
  secondaryColor: rgb(0.5, 0.5, 0.5),
  fontFamily: StandardFonts.Helvetica,
  fontSize: {
    title: 24,
    heading: 18,
    subheading: 14,
    body: 12,
  },
  margins: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
}

export function exportPdfPlugin(config?: {
  jobName?: string
  style?: Partial<ReportStyle>
}) {
  return (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        `sheet:${config?.jobName}` || 'sheet:export-pdf',
        async (event: FlatfileEvent, tick) => {
          const { environmentId, spaceId } = event.context
          try {
            await tick(1, 'Generating PDF')
            const userStyle: Partial<ReportStyle> = config?.style || {}
            const style: ReportStyle = { ...defaultStyle, ...userStyle }

            const pdfDoc = await PDFDocument.create()
            const page = pdfDoc.addPage()
            const { height } = page.getSize()

            const font = await pdfDoc.embedFont(style.fontFamily)
            const boldFont = await pdfDoc.embedFont(
              `${style.fontFamily}-Bold` as StandardFonts
            )

            const drawText = (
              text: string,
              x: number,
              y: number,
              size: number,
              font: PDFFont,
              color: Color
            ) => {
              page.drawText(text, { x, y, size, font, color })
            }

            // Title
            drawText(
              'Contact List Report',
              style.margins.left,
              height - style.margins.top,
              style.fontSize.title,
              boldFont,
              style.primaryColor
            )

            // Date
            const currentDate = new Date().toLocaleDateString()
            drawText(
              `Generated on: ${currentDate}`,
              style.margins.left,
              height - style.margins.top - 30,
              style.fontSize.body,
              font,
              style.secondaryColor
            )

            // Summary
            drawText(
              'Summary:',
              style.margins.left,
              height - style.margins.top - 70,
              style.fontSize.heading,
              boldFont,
              style.primaryColor
            )
            drawText(
              'Total Contacts: [placeholder]',
              style.margins.left,
              height - style.margins.top - 100,
              style.fontSize.body,
              font,
              style.secondaryColor
            )
            drawText(
              'Valid Emails: [placeholder]',
              style.margins.left,
              height - style.margins.top - 120,
              style.fontSize.body,
              font,
              style.secondaryColor
            )

            // Chart placeholder
            const chartSize = 200
            page.drawRectangle({
              x: style.margins.left,
              y: height - style.margins.top - 330,
              width: chartSize,
              height: chartSize,
              borderColor: style.secondaryColor,
              borderWidth: 1,
            })
            drawText(
              'Chart Placeholder',
              style.margins.left + chartSize / 2 - 50,
              height - style.margins.top - 240,
              style.fontSize.subheading,
              font,
              style.secondaryColor
            )

            // Contact list
            drawText(
              'Contact List:',
              style.margins.left,
              height - style.margins.top - 350,
              style.fontSize.heading,
              boldFont,
              style.primaryColor
            )
            drawText(
              '[Contact list placeholder]',
              style.margins.left,
              height - style.margins.top - 380,
              style.fontSize.body,
              font,
              style.secondaryColor
            )

            await tick(50, 'Saving PDF')
            // Generate the PDF in memory
            const pdfBytes = await pdfDoc.save()

            // Upload the generated PDF to Flatfile
            const tempFilePath = '/tmp/generated_report.pdf'
            fs.writeFileSync(tempFilePath, Buffer.from(pdfBytes))

            const fileStream = fs.createReadStream(tempFilePath)

            const requestPayload = {
              spaceId,
              environmentId,
              mode: 'export' as const,
            }

            await tick(90, 'Uploading PDF')
            const { data } = await api.files.upload(fileStream, requestPayload)
            console.log('File uploaded successfully:', data)

            fs.unlinkSync(tempFilePath)

            return { info: 'PDF generated and uploaded successfully' }
          } catch (error) {
            logError(
              '@flatfile/plugin-export-pdf',
              `Error generating or uploading PDF: ${error}`
            )
            throw new Error('Error generating or uploading PDF')
          }
        }
      )
    )
  }
}
