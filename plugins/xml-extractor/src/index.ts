import { parseBuffer } from './parser'
import { Extractor } from '@flatfile/util-extractor'

export const XMLExtractor = (options?: {
  separator?: string
  attributePrefix?: string
  transform?: (row: Record<string, any>) => Record<string, any>
  chunkSize?: number
  parallel?: number
}) => {
  return Extractor('.xml', parseBuffer, options)
}
