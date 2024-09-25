import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import { logInfo, logError } from '@flatfile/util-common'
import { Anthropic } from '@anthropic-ai/sdk'
import api from '@flatfile/api'

interface AIGeneratorConfig {
  numberOfRecords: number
}

export function aiGeneratorPlugin(config: AIGeneratorConfig) {
  return (listener: FlatfileListener) => {
    listener.on('job:ready', async (event: FlatfileEvent) => {
      logInfo('ai-generator-plugin', 'Received job:ready event')
      try {
        const sheet = await getSheetFromEvent(event)
        const exampleRecords = await generateExampleRecords(
          sheet,
          config.numberOfRecords
        )

        await addRecordsToSheet(event, sheet.id, exampleRecords)

        logInfo(
          'ai-generator-plugin',
          `Generated ${exampleRecords.length} example records`
        )
      } catch (error) {
        logError(
          'ai-generator-plugin',
          `Error generating example records: ${error.message}`
        )
      }
    })
  }
}

async function getSheetFromEvent(
  event: FlatfileEvent
): Promise<api.sheets.Sheet> {
  const { workbookId, sheetId } = event.context
  return await api.sheets.get(workbookId, sheetId)
}

async function generateExampleRecords(
  sheet: api.sheets.Sheet,
  count: number
): Promise<api.RecordData[]> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const fieldDescriptions = sheet.fields
    .map(
      (field) =>
        `${field.key}: ${field.type} ${
          field.constraints ? JSON.stringify(field.constraints) : ''
        }`
    )
    .join('\n')

  const prompt = `Generate ${count} example records for a dataset with the following fields:
${fieldDescriptions}

Please provide the data in JSON format, with each record as an object in an array. 
Ensure the data is diverse and contextually appropriate for each field type and constraint.`

  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const generatedData = JSON.parse(response.content[0].text)
  return generatedData.map((record: any) => ({ values: record }))
}

async function addRecordsToSheet(
  event: FlatfileEvent,
  sheetId: string,
  records: api.RecordData[]
) {
  try {
    await api.records.insert(sheetId, records)
    logInfo(
      'ai-generator-plugin',
      `Added ${records.length} records to sheet ${sheetId}`
    )
  } catch (error) {
    logError(
      'ai-generator-plugin',
      `Error adding records to sheet: ${error.message}`
    )
    throw error
  }
}
