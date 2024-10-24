import { describe, expect, it } from 'vitest'
import { performEnrichSentiment } from './enrich.sentiment.plugin'

describe('performEnrichSentiment', () => {
  it('should return an error for empty input', () => {
    const result = performEnrichSentiment('', 'description')
    expect(result.error).toBe(
      'No text found for sentiment analysis in field: description'
    )
    expect(result.result).toBeNull()
  })

  it('should analyze positive sentiment correctly', () => {
    const result = performEnrichSentiment('I love this product!', 'review')
    expect(result.error).toBeNull()
    expect(result.result).toBeTruthy()
    expect(result.result?.score).toBeGreaterThan(0)
    expect(result.result?.category).toBe('positive')
    expect(result.result?.message).toContain(
      'Sentiment analysis completed for review'
    )
  })

  it('should analyze negative sentiment correctly', () => {
    const result = performEnrichSentiment('I hate this product!', 'review')
    expect(result.error).toBeNull()
    expect(result.result).toBeTruthy()
    expect(result.result?.score).toBeLessThan(0)
    expect(result.result?.category).toBe('negative')
    expect(result.result?.message).toContain(
      'Sentiment analysis completed for review'
    )
  })

  it('should analyze neutral sentiment correctly', () => {
    const result = performEnrichSentiment('This product is okay.', 'review')
    expect(result.error).toBeNull()
    expect(result.result).toBeTruthy()
    expect(result.result?.score).toBe(0)
    expect(result.result?.category).toBe('neutral')
    expect(result.result?.message).toContain(
      'Sentiment analysis completed for review'
    )
  })

  it('should handle complex sentences', () => {
    const result = performEnrichSentiment(
      "The product has some good features, but overall it's disappointing.",
      'feedback'
    )
    expect(result.error).toBeNull()
    expect(result.result).toBeTruthy()
    expect(result.result?.score).toBeDefined()
    expect(result.result?.category).toBeDefined()
    expect(result.result?.message).toContain(
      'Sentiment analysis completed for feedback'
    )
  })
})
