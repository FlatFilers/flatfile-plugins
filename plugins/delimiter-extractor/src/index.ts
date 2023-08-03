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
  }
) => {
  return Extractor(fileExt, parseBuffer, options)
}
