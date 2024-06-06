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

export interface DelimiterOptions {
  readonly delimiter?: Delimiters
  readonly guessDelimiters?: Delimiters[]
  readonly dynamicTyping?: boolean
  readonly skipEmptyLines?: boolean | 'greedy'
  readonly transform?: (value: any) => Flatfile.CellValueUnion
  readonly chunkSize?: number
  readonly parallel?: number
  readonly headerDetectionOptions?: GetHeadersOptions
  readonly debug?: boolean
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
