import { describe, expect, it } from 'vitest'
import { extractKeyPhrases, generateSummary } from './summary.util'

describe('Summary Utility Functions', () => {
  describe('generateSummary()', () => {
    it('should generate a summary with default length', () => {
      const content =
        'This is a test sentence. This is another test sentence. And a third one for good measure.'
      const summary = generateSummary(content)
      expect(summary).toBe(
        'This is a test sentence. ... And a third one for good measure.'
      )
    })

    it('should generate a summary with specified length', () => {
      const content =
        'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.'
      const summary = generateSummary(content, { summaryLength: 3 })
      expect(summary).toBe('First sentence. ... Fifth sentence.')
    })

    it('should generate a summary with specified percentage', () => {
      const content =
        'One. Two. Three. Four. Five. Six. Seven. Eight. Nine. Ten.'
      const summary = generateSummary(content, { summaryPercentage: 30 })
      expect(summary).toBe('One. ... Ten.')
    })

    it('should handle content shorter than summary length', () => {
      const content = 'Short content.'
      const summary = generateSummary(content, { summaryLength: 5 })
      expect(summary).toBe(content)
    })
  })

  describe('extractKeyPhrases()', () => {
    it('should extract key phrases from content', () => {
      const content = 'The quick brown fox jumps over the lazy dog.'
      const keyPhrases = extractKeyPhrases(content)
      console.log('keyPhrases', keyPhrases)
      expect(keyPhrases[0]).toContain('quick brown fox')
      expect(keyPhrases[1]).toContain('lazy dog')
    })

    it('should handle content with no key phrases', () => {
      const content = '0 1 2 3 4 5 6 7 8 9'
      const keyPhrases = extractKeyPhrases(content)
      expect(keyPhrases).toHaveLength(0)
    })
  })
})
