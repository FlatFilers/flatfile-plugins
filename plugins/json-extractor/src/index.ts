import { parseBuffer } from './parser'
import { Extractor } from '../../../utils/extractor/src'

export const JSONExtractor = () => {
  return Extractor('json', parseBuffer)
}
