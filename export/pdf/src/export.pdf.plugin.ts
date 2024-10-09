import { FlatfileListener } from '@flatfile/listener'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Client } from '@anthropic-ai/sdk'
import api from '@flatfile/api'
import * as fs from 'fs'

// Initialize Flatfile client
const flatfile = new api.Client({ token: process.env.FLATFILE_API_KEY })

// Initialize Anthropic client
const anthropic = new Client(process.env.ANTHROPIC_API_KEY)

async function analyzeDataWithAI(sheetData: any[]) {
  const dataDescription = JSON.stringify(sheetData.slice(0, 10))

  const prompt = `Given the following dataset: ${dataDescription}
  
  Please provide a concise analysis of this data, including:
  1. A summary of the main features or columns in the dataset.
  2. Any notable patterns or trends you can identify.
  3. Potential insights or recommendations based on this data.
  
  Limit your response to 3-4 paragraphs.`

  const response = await anthropic.completions.create({
    model: 'claude-2',
    prompt: prompt,
    max_tokens_to_sample: 500,
  })

  return response.completion
}

async function generatePDFReport(sheetData: any[]) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

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

  const aiAnalysis = await analyzeDataWithAI(sheetData)
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
    const response = await flatfile.files.upload(fileStream, {
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

async function handleJobReady(event: any) {
  const sheetId = event.context.sheetId
  const { data: records } = await flatfile.records.get(sheetId)

  const pdfBytes = await generatePDFReport(records)

  const fileName = `report_${sheetId}_${Date.now()}.pdf`
  const spaceId = process.env.FLATFILE_SPACE_ID
  const environmentId = process.env.FLATFILE_ENVIRONMENT_ID

  if (!spaceId || !environmentId) {
    throw new Error('Flatfile Space ID or Environment ID is not set')
  }

  await uploadPDFToFlatfile(pdfBytes, fileName, spaceId, environmentId)
}

const listener = FlatfileListener.create((listener) => {
  listener.on('job:ready', async (event) => {
    try {
      await handleJobReady(event)
      await event.acknowledge()
    } catch (error) {
      console.error('Error in job:ready handler:', error)
      await event.fail(error.message)
    }
  })
})

export default listener
