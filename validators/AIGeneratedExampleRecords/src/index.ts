import {
  FlatfileListener,
  FlatfileEvent,
  FlatfileRecord,
} from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import api from '@flatfile/api'
import { AnthropicClient, CompletionRequest } from 'anthropic'

class AnthropicFlatfilePlugin {
  private anthropicClient: AnthropicClient
  private sheetConfigurations: Map<string, SheetConfig> = new Map()
  private defaultExampleRecordCount: number

  constructor(anthropicApiKey: string, defaultExampleRecordCount: number = 5) {
    this.anthropicClient = new AnthropicClient({ apiKey: anthropicApiKey })
    this.defaultExampleRecordCount = defaultExampleRecordCount
  }

  configureListener(listener: FlatfileListener): void {
    listener.use(
      recordHook('*', (record: FlatfileRecord, event: FlatfileEvent) =>
        this.processRecord(record, event)
      )
    )

    listener.on('job:ready', (event: FlatfileEvent) =>
      this.analyzeSheetConfiguration(event)
    )
    listener.on('action:generate-examples', (event: FlatfileEvent) =>
      this.generateExamplesAction(event)
    )
  }

  private async processRecord(
    record: FlatfileRecord,
    event: FlatfileEvent
  ): Promise<void> {
    try {
      const fieldToProcess = record.get('fieldName') as string
      if (fieldToProcess) {
        const processedContent = await this.useAnthropicAI(fieldToProcess)
        record.set('processedField', processedContent)
      }
    } catch (error) {
      record.addError('processedField', `AI processing error: ${error.message}`)
    }
  }

  private async analyzeSheetConfiguration(event: FlatfileEvent): Promise<void> {
    const sheetId = event.context.sheetId
    const sheet = await api.sheets.get(sheetId)
    this.sheetConfigurations.set(sheetId, {
      fields: sheet.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
      })),
    })
  }

  private async generateExamplesAction(event: FlatfileEvent): Promise<void> {
    try {
      const sheetId = event.context.sheetId
      const count = event.context.count || this.defaultExampleRecordCount

      const exampleRecords = await this.generateExampleRecords(sheetId, count)
      await this.addExampleRecordsToSheet(sheetId, exampleRecords)

      await event.reply(
        `Successfully generated ${exampleRecords.length} example records.`
      )
    } catch (error) {
      await event.reply(`Failed to generate example records: ${error.message}`)
    }
  }

  private async addExampleRecordsToSheet(
    sheetId: string,
    records: Record<string, string>[]
  ): Promise<void> {
    await api.records.insert(sheetId, records)
  }

  private async generateExampleRecords(
    sheetId: string,
    count: number
  ): Promise<Record<string, string>[]> {
    const sheetConfig = this.sheetConfigurations.get(sheetId)
    if (!sheetConfig) {
      throw new Error(`Sheet configuration not found for sheet ID: ${sheetId}`)
    }

    const exampleRecords: Record<string, string>[] = []
    for (let i = 0; i < count; i++) {
      exampleRecords.push(await this.generateExampleRecord(sheetConfig))
    }

    return exampleRecords
  }

  private async generateExampleRecord(
    sheetConfig: SheetConfig
  ): Promise<Record<string, string>> {
    const prompt = `Generate example data for the following fields:\n\n${sheetConfig.fields
      .map((f) => `- ${f.label} (${f.type})`)
      .join('\n')}\n\nProvide the data in a JSON format.`

    const response = await this.anthropicClient.completions.create({
      prompt,
      model: 'claude-2',
      max_tokens_to_sample: 300,
    })

    const generatedData = JSON.parse(response.completion)
    const record: Record<string, string> = {}

    for (const field of sheetConfig.fields) {
      if (generatedData[field.key]) {
        record[field.key] = generatedData[field.key]
      }
    }

    return record
  }

  private async useAnthropicAI(input: string): Promise<string> {
    const response = await this.anthropicClient.completions.create({
      prompt: `Process this text: ${input}`,
      model: 'claude-2',
      max_tokens_to_sample: 100,
    })

    return response.completion
  }
}

interface SheetConfig {
  fields: FieldConfig[]
}

interface FieldConfig {
  key: string
  label: string
  type: string
}

export default AnthropicFlatfilePlugin
