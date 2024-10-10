import Anthropic from '@anthropic-ai/sdk'
import { TextBlock } from '@anthropic-ai/sdk/resources'

export async function analyzeDataWithAI(
  sheetData: any[],
  ANTHROPIC_API_KEY: string
): Promise<TextBlock> {
  const dataDescription = JSON.stringify(sheetData)

  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  })

  const prompt = `Given the following dataset: ${dataDescription}
  
  Please provide a concise analysis of this data, including:
  1. A summary of the main features or columns in the dataset.
  2. Any notable patterns or trends you can identify.
  3. Potential insights or recommendations based on this data.
  
  Limit your response to 3-4 paragraphs.`

  const response = await anthropic.messages.create({
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    model: 'claude-3-opus-20240229',
  })

  return response.content[0] as TextBlock
}
