import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { Simplified } from '@flatfile/util-common'
// import Chart from 'chart.js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function pdfGeneratorPlugin() {
  return (listener: FlatfileListener) => {
    listener.on(
      'job:ready',
      { operation: 'action:generatePDF' },
      async (event: FlatfileEvent) => {
        const { workbookId } = event.context

        try {
          const { headers, values } = await fetchWorkbookData(workbookId)
          await generatePDF(workbookId, headers, values)
          console.log(`PDF generated successfully for workbook ${workbookId}`)
        } catch (error) {
          console.error(
            `Error generating PDF for workbook ${workbookId}:`,
            error
          )
        }
      }
    )
  }
}

async function generatePDF(
  workbookId: string,
  head: any[],
  body: any[],
  options: any = {}
) {
  const {
    fontSize = 12,
    fontName = 'helvetica',
    textColor = '#000000',
    headerColor = '#4a86e8',
    tableHeaderColor = '#c9daf8',
    // chartType = 'bar',
    pageSize = 'a4',
    orientation = 'portrait',
  } = options

  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize,
  })

  doc.setFont(fontName)
  doc.setTextColor(textColor)

  doc.setFontSize(fontSize * 1.5)
  doc.setTextColor(headerColor)
  doc.text(`Workbook Report: ${workbookId}`, 14, 22)

  doc.setFontSize(fontSize)
  doc.setTextColor(textColor)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32)

  const summary = generateDataSummary(body)
  doc.text(summary, 14, 42)

  autoTable(doc, {
    startY: 50,
    head,
    body,
    headStyles: { fillColor: tableHeaderColor, textColor: textColor },
    styles: { fontSize: fontSize },
  })

  // const chartImage = await generateChartImage(data, chartType)
  // doc.addImage(chartImage, 'PNG', 14, 120, 180, 100)

  doc.save(`report_${workbookId}.pdf`)
}

function generateDataSummary(data: any[]): string {
  return `Total records: ${data.length}`
}

// async function generateChartImage(
//   data: any[],
//   chartType: string
// ): Promise<string> {
//   const canvas = document.createElement('canvas')
//   canvas.width = 600
//   canvas.height = 400

//   const ctx = canvas.getContext('2d')
//   new Chart(ctx, {
//     type: chartType,
//     data: {
//       labels: data.map((item) => item.column1),
//       datasets: [
//         {
//           label: 'Value',
//           data: data.map((item) => item.column2),
//           backgroundColor: 'rgba(75, 192, 192, 0.6)',
//         },
//       ],
//     },
//     options: {
//       responsive: false,
//       scales: {
//         y: {
//           beginAtZero: true,
//         },
//       },
//     },
//   })

//   return canvas.toDataURL('image/png')
// }

async function fetchWorkbookData(
  sheetId: string
): Promise<{ headers: string[]; values: any[][] }> {
  // Implement this function to retrieve data from Flatfile using the API
  // This is a placeholder implementation
  try {
    const { data: sheet } = await api.sheets.get(sheetId)
    // Fetch data from the first sheet

    const headers = sheet.config.fields.map((field) => field.label)
    const fieldKeys = sheet.config.fields.map((field) => field.key)

    const records = await Simplified.getAllRecords(sheetId)

    const values = records.map((record) => fieldKeys.map((key) => record[key]))

    return { headers, values }
  } catch (error) {
    console.error('Error fetching workbook data:', error)
    throw error
  }
}

export default pdfGeneratorPlugin
