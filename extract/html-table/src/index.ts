import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export interface HTMLTableExtractorOptions {
  handleColspan?: boolean
  handleRowspan?: boolean
  maxDepth?: number
  debug?: boolean
}

export const HTMLTableExtractor = (options: HTMLTableExtractorOptions = {}) => {
  return Extractor('html', 'html-tables', parseBuffer, options)
}

export const htmlTableParser = parseBuffer
