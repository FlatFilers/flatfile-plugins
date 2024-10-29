import type { FlatfileListener } from '@flatfile/listener'
import { recordHook } from '@flatfile/plugin-record-hook'
import Sentiment from 'sentiment'

export interface EnrichSentimentConfig {
  sheetSlug: string
  textFields: string[]
  automaticValidation: boolean
  errorMessages?: {
    required?: string
    invalid?: string
    disposable?: string
    domain?: string
  }
}

// Initialize sentiment analyzer
const sentiment = new Sentiment()

// Function to analyze and categorize sentiment
export function analyzeSentiment(text: string) {
  const result = sentiment.analyze(text)
  let category: 'positive' | 'negative' | 'neutral'

  if (result.score > 0) {
    category = 'positive'
  } else if (result.score < 0) {
    category = 'negative'
  } else {
    category = 'neutral'
  }

  return {
    score: result.score,
    category: category,
  }
}

// Separate logic for sentiment analysis
export function performEnrichSentiment(value: string, field: string) {
  if (!value) {
    return {
      error: `No text found for sentiment analysis in field: ${field}`,
      result: null,
    }
  }

  const sentimentResult = analyzeSentiment(value)
  return {
    error: null,
    result: {
      score: sentimentResult.score,
      category: sentimentResult.category,
      message: `Sentiment analysis completed for ${field}. Score: ${sentimentResult.score}, Category: ${sentimentResult.category}`,
    },
  }
}

// Create a configurable RecordHook
export function enrichSentiment(config: EnrichSentimentConfig) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug, async (record, event) => {
        const textFields = config.textFields || ['description']

        if (config.automaticValidation) {
          for (const field of textFields) {
            const fieldValue = String(record.get(field))
            const { error, result } = performEnrichSentiment(fieldValue, field)

            if (error) {
              record.addWarning('sentiment_analysis', error)
            } else if (result) {
              // Add sentiment analysis results as new fields in the record
              record.set(`${field}_sentiment_score`, result.score)
              record.set(`${field}_sentiment_category`, result.category)

              // Add a message about the sentiment analysis
              record.addInfo('sentiment_analysis', result.message)
            }
          }
        } else {
          record.addInfo(
            'sentiment_analysis',
            'Automatic sentiment analysis is disabled'
          )
        }

        return record
      })
    )
  }
}

export default enrichSentiment
