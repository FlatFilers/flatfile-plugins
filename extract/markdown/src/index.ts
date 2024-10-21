import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export interface ExtractMarkdownOptions {
  maxTables?: number
  errorHandling?: 'strict' | 'lenient'
  debug?: boolean
}

export const extractMarkdown = (options: ExtractMarkdownOptions = {}) => {
  return Extractor('.md', 'markdown', parseBuffer, options)
}

export const markdownParser = parseBuffer
