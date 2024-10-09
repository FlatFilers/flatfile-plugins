import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export interface MarkdownExtractorOptions {
  maxTables?: number
  errorHandling?: 'strict' | 'lenient'
  debug?: boolean
}

export const MarkdownExtractor = (options: MarkdownExtractorOptions = {}) => {
  const defaultOptions: MarkdownExtractorOptions = {
    maxTables: Infinity,
    errorHandling: 'lenient',
    debug: false,
    ...options,
  }

  return Extractor(
    '.md',
    'markdown',
    (buffer: Buffer) => parseBuffer(buffer, defaultOptions),
    {
      ...options,
    }
  )
}

export const markdownParser = parseBuffer
