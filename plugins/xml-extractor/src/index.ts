import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export const XMLExtractor = (options?: {
  separator?: string
  attributePrefix?: string
  transform?: (row: Record<string, any>) => Record<string, any>
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return Extractor('.xml', 'xml', parseBuffer, options)
}

export const xmlParser = parseBuffer
