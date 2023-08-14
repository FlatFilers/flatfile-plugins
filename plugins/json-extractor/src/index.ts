import { parseBuffer } from './parser'
import { Extractor } from '@flatfile/util-extractor'

export const JSONExtractor = (options: {
  chunkSize?: number
  parallel?: number
}) => {
  return Extractor('.json', parseBuffer, options)
}

/*
 * @deprecated use `JSONExtractor` instead
 */
export const jsonExtractorPlugin = JSONExtractor
