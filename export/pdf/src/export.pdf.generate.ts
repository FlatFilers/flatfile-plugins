import { FlatfileEvent } from '@flatfile/listener'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { analyzeDataWithAI } from './export.pdf.analyze'

export async function generatePDFReport(
  sheetData: any[],
  event: FlatfileEvent
) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const anthropicApiKey =
    process.env.ANTHROPIC_API_KEY || (await event.secrets('ANTHROPIC_API_KEY'))

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
  console.log('aiAnalysis', aiAnalysis)
  const words = aiAnalysis.text.split(' ')
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
