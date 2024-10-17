import type { Flatfile } from '@flatfile/api'
import { LLMHandler } from './llm.handler'

export async function generateExampleRecords(
  model: string,
  apiKey: string,
  sheet: Flatfile.Sheet,
  count: number,
  debug?: boolean
): Promise<Flatfile.RecordData[]> {
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

  const llm = new LLMHandler(model, apiKey)
  const response = await llm.handleMessage('', prompt)
  const responseText = response.content as string

  if (debug) {
    console.dir(responseText, { depth: null })
  }

  const jsonRegex = new RegExp(`\`\`\`json\\n([\\s\\S]*?)\\n\`\`\``)
  const match = responseText.match(jsonRegex)
  const generatedData = match?.[1] ?? responseText

  const jsonGeneratedData = JSON.parse(generatedData)

  return jsonGeneratedData.map((record: any) => {
    const formattedRecord: { [key: string]: { value: any } } = {}
    for (const [key, value] of Object.entries(record)) {
      formattedRecord[key] = { value }
    }
    return formattedRecord
  })
}
