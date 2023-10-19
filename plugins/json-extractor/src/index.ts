import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export const JSONExtractor = (options?: {
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return Extractor('.json', 'json', parseBuffer, options)
}

export const jsonParser = parseBuffer

/*
 * @deprecated use `JSONExtractor` instead
 */
export const jsonExtractorPlugin = JSONExtractor
