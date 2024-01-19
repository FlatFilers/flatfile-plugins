import { Flatfile } from '@flatfile/api'
import { Extractor } from '@flatfile/util-extractor'
import { GetHeadersOptions } from './header.detection'
import { parseBuffer } from './parser'

export enum NativeFileTypes {
  CSV = 'csv',
  TSV = 'tsv',
  PSV = 'psv',
}

export type Delimiters = ',' | '|' | '\t' | ';' | ':' | '~' | '^' | '#'

interface DelimiterOptions {
  delimiter?: Delimiters
  guessDelimiters?: Delimiters[]
  dynamicTyping?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
  chunkSize?: number
  parallel?: number
  headerDetectionOptions?: GetHeadersOptions
  debug?: boolean
}

export const DelimiterExtractor = (
  fileExt: string,
  options: DelimiterOptions
) => {
  if (Object.values(NativeFileTypes).includes(fileExt as NativeFileTypes)) {
    throw new Error(
      `${fileExt} is a native file type and not supported by the delimiter extractor.`
    )
  }

  return Extractor(fileExt, 'delimiter', parseBuffer, options)
}

export const delimiterParser = parseBuffer
