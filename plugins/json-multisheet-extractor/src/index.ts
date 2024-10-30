import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export const JSONMultiSheetExtractor = (options?: {
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return Extractor('.json', 'json', parseBuffer, options)
}

export const jsonParser = parseBuffer