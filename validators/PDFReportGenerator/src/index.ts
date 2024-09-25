import { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import PDFDocument from 'pdfkit'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import api from '@flatfile/api'

const listener = FlatfileListener.create((client) => {
  configureSpace(client)

  client.on('action:generatePDFReport', async ({ context, payload }) => {
    const { workbookId, sheetId, reportTemplate, chartData, styling } = payload

    // Fetch data from the sheet
    const records = await api.records.get(sheetId)

    // Generate PDF
    const pdfBuffer = await generatePDF(
      records.data,
      reportTemplate,
      chartData,
      styling
    )

    // Upload PDF to Flatfile
    const file = await api.files.upload(pdfBuffer, {
      workbookId,
      name: 'generated-report.pdf',
      mimetype: 'application/pdf',
    })

    return {
      outcome: {
        message: 'PDF report generated and uploaded successfully.',
        fileName: file.name,
        fileId: file.id,
      },
    }
  })
})

async function generatePDF(data, template, chartData, styling) {
  return new Promise((resolve) => {
    const doc = new PDFDocument(styling.documentOptions || {})
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))

    // Apply styling
    if (styling.font) doc.font(styling.font)
    if (styling.fontSize) doc.fontSize(styling.fontSize)

    // Add title
    doc.text(template.title, { align: 'center' })
    doc.moveDown()

    // Add dynamic content
    template.sections.forEach((section) => {
      doc.text(section.title)
      doc.moveDown(0.5)

      if (section.type === 'table') {
        const table = data.map((record) =>
          section.columns.map((col) => record[col])
        )
        doc.table(table, section.options)
      } else if (section.type === 'text') {
        const content = section.content.replace(
          /\{(\w+)\}/g,
          (_, key) => data[0][key] || ''
        )
        doc.text(content)
      } else if (section.type === 'chart' && chartData) {
        const chartBuffer = generateChart(chartData[section.chartId])
        doc.image(chartBuffer, section.options)
      }

      doc.moveDown()
    })

    doc.end()
  })
}

function generateChart(chartConfig) {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 400, height: 200 })
  return chartJSNodeCanvas.renderToBuffer(chartConfig)
}

export default listener
