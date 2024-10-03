import api from '@flatfile/api'
import { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import Chart from 'chart.js/auto'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default function pdfGeneratorPlugin(listener: FlatfileListener) {
  listener.on('job:ready', async (event: FlatfileEvent) => {
    const { jobId, workbookId } = event.context
    console.log(
      `Job ${jobId} is ready. Generating PDF for workbook ${workbookId}`
    )

    try {
      const data = await fetchWorkbookData(workbookId)
      await generatePDF(workbookId, data)
      console.log(`PDF generated successfully for workbook ${workbookId}`)
    } catch (error) {
      console.error(`Error generating PDF for workbook ${workbookId}:`, error)
    }
  })

  listener.use(
    recordHook('**', async (record) => {
      const email = record.get('email') as string
      if (email) {
        const validEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!validEmailAddress.test(email)) {
          record.addError('email', 'Invalid email address')
        }
      }
      return record
    })
  )

  listener.on('action:generatePDF', async (event: FlatfileEvent) => {
    const { workbookId } = event.context
    console.log(`Manual PDF generation requested for workbook ${workbookId}`)

    try {
      const data = await fetchWorkbookData(workbookId)
      await generatePDF(workbookId, data)
      console.log(`PDF generated successfully for workbook ${workbookId}`)
    } catch (error) {
      console.error(`Error generating PDF for workbook ${workbookId}:`, error)
    }
  })

  listener.on('file:created', async (event: FlatfileEvent) => {
    const { fileId, spaceId, environmentId } = event.context
    const token = event.secrets.apiKey

    try {
      const uploadResult = await uploadFileToFlatfile(
        fileId,
        spaceId,
        environmentId,
        token
      )
      console.log('File uploaded successfully:', uploadResult)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  })
}

async function generatePDF(workbookId: string, data: any[], options: any = {}) {
  const {
    fontSize = 12,
    fontName = 'helvetica',
    textColor = '#000000',
    headerColor = '#4a86e8',
    tableHeaderColor = '#c9daf8',
    chartType = 'bar',
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

  const summary = generateDataSummary(data)
  doc.text(summary, 14, 42)

  const tableData = generateTableData(data)
  doc.autoTable({
    startY: 50,
    head: [['Column 1', 'Column 2', 'Column 3']],
    body: tableData,
    headStyles: { fillColor: tableHeaderColor, textColor: textColor },
    styles: { fontSize: fontSize },
  })

  const chartImage = await generateChartImage(data, chartType)
  doc.addImage(chartImage, 'PNG', 14, 120, 180, 100)

  doc.save(`report_${workbookId}.pdf`)
}

function generateDataSummary(data: any[]): string {
  return `Total records: ${data.length}`
}

function generateTableData(data: any[]): any[][] {
  return data.map((item) => [item.column1, item.column2, item.column3])
}

async function generateChartImage(
  data: any[],
  chartType: string
): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400

  const ctx = canvas.getContext('2d')
  new Chart(ctx, {
    type: chartType,
    data: {
      labels: data.map((item) => item.column1),
      datasets: [
        {
          label: 'Value',
          data: data.map((item) => item.column2),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    },
    options: {
      responsive: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })

  return canvas.toDataURL('image/png')
}

async function uploadFileToFlatfile(
  fileId: string,
  spaceId: string,
  environmentId: string,
  token: string
) {
  const apiUrl = 'https://api.x.flatfile.com/v1/files'

  const formData = new FormData()
  formData.append('fileId', fileId)
  formData.append('spaceId', spaceId)
  formData.append('environmentId', environmentId)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Disable-Hooks': 'true',
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

async function fetchWorkbookData(workbookId: string): Promise<any[]> {
  // Implement this function to retrieve data from Flatfile using the API
  // This is a placeholder implementation
  try {
    const workbook = await api.workbooks.get(workbookId)
    const sheets = await api.sheets.list({ workbookId })
    // Fetch data from the first sheet
    if (sheets.data.length > 0) {
      const records = await api.records.get(sheets.data[0].id)
      return records.data.map((record) => record.values)
    }
    return []
  } catch (error) {
    console.error('Error fetching workbook data:', error)
    throw error
  }
}
