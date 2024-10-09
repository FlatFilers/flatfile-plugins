import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Client } from '@anthropic-ai/sdk'
import api from '@flatfile/api'
import * as fs from 'fs'
import { jobHandler } from '@flatfile/plugin-job-handler'

async function analyzeDataWithAI(sheetData: any[], ANTHROPIC_API_KEY: string) {
  const dataDescription = JSON.stringify(sheetData)

  const anthropic = new Client(ANTHROPIC_API_KEY)

  const prompt = `Given the following dataset: ${dataDescription}
  
  Please provide a concise analysis of this data, including:
  1. A summary of the main features or columns in the dataset.
  2. Any notable patterns or trends you can identify.
  3. Potential insights or recommendations based on this data.
  
  Limit your response to 3-4 paragraphs.`

  const response = await anthropic.completions.create({
    model: 'claude-2',
    prompt: prompt,
  })

  return response.completion
}

async function generatePDFReport(sheetData: any[], event) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const anthropicApiKey =
    process.env.ANTHROPIC_API_KEY || event.secrets('ANTHROPIC_API_KEY')

  if (!anthropicApiKey) {
    throw new Error('Anthropic API key is not set')
  }
  // Add title
  page.drawText('Data Analysis Report', {
    x: 50,
    y: height - 50,
    size: 24,
    font,
    color: rgb(0, 0, 0),
  })

  // Add data summary
  let yOffset = height - 100
  page.drawText(`Total Records: ${sheetData.length}`, {
    x: 50,
    y: yOffset,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  })

  // Placeholder for chart/graph
  yOffset -= 30
  page.drawRectangle({
    x: 50,
    y: yOffset - 200,
    width: 300,
    height: 200,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  })
  page.drawText('Chart Placeholder', {
    x: 175,
    y: yOffset - 100,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })

  // AI analysis
  yOffset -= 250
  page.drawText('AI Analysis:', {
    x: 50,
    y: yOffset,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  })
  yOffset -= 20

  const aiAnalysis = await analyzeDataWithAI(sheetData, anthropicApiKey)
  const words = aiAnalysis.split(' ')
  let line = ''
  for (const word of words) {
    if ((line + word).length > 70) {
      page.drawText(line, {
        x: 50,
        y: yOffset,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      })
      yOffset -= 15
      line = ''
    }
    line += (line ? ' ' : '') + word
  }
  if (line) {
    page.drawText(line, {
      x: 50,
      y: yOffset,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    })
  }

  return pdfDoc.save()
}

async function uploadPDFToFlatfile(
  pdfBytes: Uint8Array,
  fileName: string,
  spaceId: string,
  environmentId: string
) {
  const tempFilePath = `/tmp/${fileName}`
  fs.writeFileSync(tempFilePath, Buffer.from(pdfBytes))
  const fileStream = fs.createReadStream(tempFilePath)

  try {
    const response = await api.files.upload(fileStream, {
      spaceId,
      environmentId,
    })
    fs.unlinkSync(tempFilePath)
    return response.data
  } catch (error) {
    fs.unlinkSync(tempFilePath)
    throw error
  }
}

async function handleJobReady(event: FlatfileEvent) {
  const { context } = event.payload
  const sheetId = context.sheetId

  if (!sheetId) {
    throw new Error('Sheet ID is missing from the event context')
  }

  const { data: records } = await api.records.get(sheetId, { pageSize: 50 })

  const pdfBytes = await generatePDFReport(records.records, event)

  const fileName = `report_${sheetId}_${Date.now()}.pdf`
  const spaceId = process.env.FLATFILE_SPACE_ID
  const environmentId = process.env.FLATFILE_ENVIRONMENT_ID

  if (!spaceId || !environmentId) {
    throw new Error('Flatfile Space ID or Environment ID is not set')
  }

  await uploadPDFToFlatfile(pdfBytes, fileName, spaceId, environmentId)
}

const listener = FlatfileListener.create((listener) => {
  listener.use(
    jobHandler('pdf-export', async (event) => {
      await handleJobReady(event)
    })
  )
})

export default listener
