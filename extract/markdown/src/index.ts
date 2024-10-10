import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export interface MarkdownExtractorOptions {
  maxTables?: number
  errorHandling?: 'strict' | 'lenient'
  debug?: boolean
}

export const MarkdownExtractor = (options: MarkdownExtractorOptions = {}) => {
  return Extractor('.md', 'markdown', parseBuffer, options)
}

export const markdownParser = parseBuffer
