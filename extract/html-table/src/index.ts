import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export interface ExtractHTMLTableOptions {
  handleColspan?: boolean
  handleRowspan?: boolean
  maxDepth?: number
  debug?: boolean
}

export const extractHTMLTable = (options: ExtractHTMLTableOptions = {}) => {
  return Extractor('html', 'html-tables', parseBuffer, options)
}

export const parseHTMLTable = parseBuffer
