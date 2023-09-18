import { Flatfile } from '@flatfile/api'
import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export const DelimiterExtractor = (
  fileExt: string,
  options: {
    delimiter: ';' | ':' | '~' | '^' | '#'
    dynamicTyping?: boolean
    skipEmptyLines?: boolean | 'greedy'
    transform?: (value: any) => Flatfile.CellValueUnion
    chunkSize?: number
    parallel?: number
  }
) => {
  return Extractor(fileExt, parseBuffer, options)
}
