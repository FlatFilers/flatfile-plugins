import { recordHook } from '@flatfile/plugin-record-hook'
import { FlatfileListener } from '@flatfile/listener'
import Sentiment from 'sentiment'

interface SentimentAnalyzerConfig {
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
function analyzeSentiment(text) {
  const result = sentiment.analyze(text)
  let category

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

// Create a configurable RecordHook
export default function sentimentAnalyzerPlugin(
  config: SentimentAnalyzerConfig
) {
  return (listener: FlatfileListener) => {
    listener.use(
      recordHook(config.sheetSlug, async (record, event) => {
        const textFields = config.textFields || ['description']

        if (config.automaticValidation) {
          for (const field of textFields) {
            const fieldValue = record.get(field)
            if (fieldValue) {
              const sentimentResult = analyzeSentiment(fieldValue)

              // Add sentiment analysis results as new fields in the record
              record.set(`${field}_sentiment_score`, sentimentResult.score)
              record.set(
                `${field}_sentiment_category`,
                sentimentResult.category
              )

              // Add a message about the sentiment analysis
              record.addInfo(
                'sentiment_analysis',
                `Sentiment analysis completed for ${field}. Score: ${sentimentResult.score}, Category: ${sentimentResult.category}`
              )
            } else {
              record.addWarning(
                'sentiment_analysis',
                `No text found for sentiment analysis in field: ${field}`
              )
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
