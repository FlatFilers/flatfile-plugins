import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export interface ExtractJSONOptions {
  chunkSize?: number
  parallel?: number
  debug?: boolean
}

export const extractJSON = (options?: ExtractJSONOptions) => {
  return Extractor('.json', 'json', parseBuffer, options)
}

export const jsonParser = parseBuffer
