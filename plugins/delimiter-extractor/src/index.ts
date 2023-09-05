import { parseBuffer } from './parser'
import { Flatfile } from '@flatfile/api'
import { Extractor } from '@flatfile/util-extractor'

export const DelimiterExtractor = (
  fileExt: string,
  options: {
    delimiter: '\t' | '|' | ';' | ':' | '~' | '^' | '#'
    dynamicTyping?: boolean
    skipEmptyLines?: boolean | 'greedy'
    transform?: (value: any) => Flatfile.CellValueUnion
    chunkSize?: number
    parallel?: number
  }
) => {
  return Extractor(fileExt, parseBuffer, options)
}
