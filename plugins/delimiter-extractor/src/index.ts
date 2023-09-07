import { Flatfile } from '@flatfile/api'
import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

const delimiterMap = {
  '\t': 'tsv',
  '|': 'pipe',
  ',': 'csv',
  ';': 'ssv',
  ':': 'dsv',
  '~': 'tilde',
  '^': 'caret',
  '#': 'hash',
}

type Delimiter = keyof typeof delimiterMap

interface DelimiterOptions {
  delimiter: Delimiter
  dynamicTyping?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
  chunkSize?: number
  parallel?: number
}

export const DelimiterExtractor = (
  fileExt: string,
  { delimiter, ...restOptions }: DelimiterOptions
) => {
  const operation = delimiterMap[delimiter]

  if (!operation) {
    throw new Error(`Unsupported delimiter "${delimiter}" provided.`)
  }

  return Extractor(fileExt, operation, parseBuffer, {
    delimiter,
    ...restOptions,
  })
}
