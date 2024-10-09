import nlp from 'compromise'

export interface SummaryOptions {
  summaryLength?: number
  summaryPercentage?: number
}

export function generateSummary(
  content: string,
  options: SummaryOptions = {}
): string {
  const doc = nlp(content)
  const sentences = doc.sentences().out('array')

  let summaryLength = options.summaryLength || 2
  if (options.summaryPercentage) {
    summaryLength = Math.max(
      1,
      Math.floor((sentences.length * options.summaryPercentage) / 100)
    )
  }

  if (sentences.length <= summaryLength) {
    return sentences.join(' ')
  }

  const middleIndex = Math.floor(summaryLength / 2)
  const firstPart = sentences.slice(0, middleIndex).join(' ')
  const lastPart = sentences.slice(-middleIndex).join(' ')
  return `${firstPart} ... ${lastPart}`
}

export function extractKeyPhrases(content: string): string[] {
  const doc = nlp(content)
  // This line extracts key phrases from the content using compromise (nlp)
  // It matches patterns of up to two optional adjectives followed by one or more nouns
  // '#Adjective? #Adjective?' allows matching for up to two optional adjectives
  // '#Noun+' matches one or more nouns
  // The 'out('array')' method returns the matches as an array of strings
  return doc.match('#Adjective? #Adjective? #Noun+').out('array')
}
