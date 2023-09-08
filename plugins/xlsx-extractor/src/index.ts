import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

export const ExcelExtractor = (options?: {
  rawNumbers?: boolean
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return Extractor(
    /\.(xlsx?|xlsm|xlsb|xltx?|xltm)$/i,
    'excel',
    parseBuffer,
    options
  )
}

/*
 * @deprecated use `ExcelExtractor` instead
 */
export const xlsxExtractorPlugin = ExcelExtractor
