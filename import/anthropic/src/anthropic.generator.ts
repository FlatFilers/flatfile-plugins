import { Anthropic } from '@anthropic-ai/sdk'
import { TextBlock } from '@anthropic-ai/sdk/resources'
import type { Flatfile } from '@flatfile/api'

export async function generateExampleRecords(
  apiKey: string,
  sheet: Flatfile.Sheet,
  count: number
): Promise<Flatfile.RecordData[]> {
  const anthropic = new Anthropic({
    apiKey,
  })

  const fieldDescriptions = sheet.config.fields
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
Ensure the data is diverse and contextually appropriate for each field type and constraint.

Return only the JSON data, no other text or comments.`

  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = (response.content[0] as TextBlock).text
  const generatedData = JSON.parse(responseText)

  return generatedData.map((record: any) => {
    const formattedRecord: { [key: string]: { value: any } } = {}
    for (const [key, value] of Object.entries(record)) {
      formattedRecord[key] = { value }
    }
    return formattedRecord
  })
}
