import { parseBuffer } from './parser'
import { Extractor } from '@flatfile/util-extractor'

export const JSONExtractor = () => {
  return Extractor('json', parseBuffer)
}
