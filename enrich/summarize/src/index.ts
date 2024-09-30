import { type FlatfileRecord, recordHook } from '@flatfile/plugin-record-hook'
import nlp from 'compromise'

interface SummarizationConfig {
  sheetSlug: string
  contentField: string
  summaryField: string
  keyPhrasesField: string
  summaryLength?: number
  summaryPercentage?: number
}

export function summarizationPlugin(config: SummarizationConfig) {
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
      const doc = nlp(content)
      const sentences = doc.sentences().out('array')

      let summaryLength = config.summaryLength || 2
      if (config.summaryPercentage) {
        summaryLength = Math.max(
          1,
          Math.floor((sentences.length * config.summaryPercentage) / 100)
        )
      }

      let summary = ''
      if (sentences.length > 0) {
        if (sentences.length <= summaryLength) {
          summary = sentences.join(' ')
        } else {
          const middleIndex = Math.floor(summaryLength / 2)
          const firstPart = sentences.slice(0, middleIndex).join(' ')
          const lastPart = sentences.slice(-middleIndex).join(' ')
          summary = `${firstPart} ... ${lastPart}`
        }
      }

      record.set(config.summaryField, summary)

      const keyPhrases = doc
        .match('#Noun+ (#Adjective|#Noun){0,2}')
        .out('array')
      record.set(config.keyPhrasesField, keyPhrases.join(', '))
    }

    return record
  })
}
