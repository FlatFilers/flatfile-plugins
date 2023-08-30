import { parseBuffer } from './parser'
import { Extractor } from '@flatfile/util-extractor'

export const ExcelExtractor = (options?: {
  rawNumbers?: boolean
  chunkSize?: number
  parallel?: number
}) => {
  return Extractor(/\.(xlsx?|xlsm|xlsb|xltx?|xltm)$/i, parseBuffer, options)
}

/*
 * @deprecated use `ExcelExtractor` instead
 */
export const xlsxExtractorPlugin = ExcelExtractor
