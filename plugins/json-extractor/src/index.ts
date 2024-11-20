import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export interface PluginOptions {
  chunkSize?: number
  parallel?: number
  debug?: boolean
}

export const JSONExtractor = (options?: PluginOptions) => {
  return Extractor(/\.(jsonl?|jsonlines)$/i, 'json', parseBuffer, options)
}

export const jsonParser = parseBuffer

/*
 * @deprecated use `JSONExtractor` instead
 */
export const jsonExtractorPlugin = JSONExtractor
