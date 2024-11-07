import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import { extractKeyPhrases, generateSummary } from './summary.util'

interface SummarizationConfig {
  sheetSlug: string
  contentField: string
  summaryField: string
  keyPhrasesField: string
  summaryLength?: number
  summaryPercentage?: number
}

export function summarize(config: SummarizationConfig) {
  return recordHook(config.sheetSlug, (record: FlatfileRecord) => {
    const content = record.get(config.contentField) as string
    const existingSummary = record.get(config.summaryField) as string

    if (!content) {
      record.addError(
        config.contentField,
        'Content is required for summarization'
      )
      return record
    }

    if (!existingSummary) {
      const summary = generateSummary(content, {
        summaryLength: config.summaryLength,
        summaryPercentage: config.summaryPercentage,
      })
      record.set(config.summaryField, summary)

      const keyPhrases = extractKeyPhrases(content)
      record.set(config.keyPhrasesField, keyPhrases.join(', '))
    }

    return record
  })
}
