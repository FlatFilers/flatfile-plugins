import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import { PDFDocument, rgb, StandardFonts, PDFFont, Color } from 'pdf-lib'
import api from '@flatfile/api'
import * as fs from 'fs'

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

export default function (listener: FlatfileListener) {
  listener.on(
    'job:ready',
    { job: `sheet:generate_pdf` },
    async (event: FlatfileEvent) => {
      const { action, context } = event
      try {
        const userStyle: Partial<ReportStyle> = action.payload?.style || {}
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

        // Generate the PDF in memory
        const pdfBytes = await pdfDoc.save()

        // Upload the generated PDF to Flatfile
        const tempFilePath = '/tmp/generated_report.pdf'
        fs.writeFileSync(tempFilePath, Buffer.from(pdfBytes))

        const fileStream = fs.createReadStream(tempFilePath)

        const requestPayload = {
          spaceId: context.spaceId,
          environmentId: context.environmentId,
          mode: 'import' as const,
        }

        const uploadResponse = await api.files.upload(
          fileStream,
          requestPayload
        )
        console.log('File uploaded successfully:', uploadResponse.data)

        fs.unlinkSync(tempFilePath)

        await event.reply('PDF generated and uploaded successfully')
      } catch (error) {
        console.error('Error generating or uploading PDF:', error)
        await event.reply('Error generating or uploading PDF')
      }
    }
  )
}
