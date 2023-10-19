import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer } from './parser'

/**
 * Plugin config options.
 *
 * @property {boolean} raw - if true, return raw data; if false, return formatted text.
 * @property {boolean} rawNumbers - if true, return raw numbers; if false, return formatted numbers.
 * @property {number} chunkSize - the size of chunk to process when inserting records.
 * @property {number} parallel - the quantity of parallel process when inserting records.
 * @property {boolean} debug - if true, display helpful console logs.
 */
export interface ExcelExtractorOptions {
  readonly raw?: boolean
  readonly rawNumbers?: boolean
  readonly chunkSize?: number
  readonly parallel?: number
  readonly debug?: boolean
}

export const ExcelExtractor = (options?: ExcelExtractorOptions) => {
  return Extractor(
    /\.(xlsx?|xlsm|xlsb|xltx?|xltm)$/i,
    'excel',
    parseBuffer,
    options
  )
}

export const excelParser = parseBuffer

/*
 * @deprecated use `ExcelExtractor` instead
 */
export const xlsxExtractorPlugin = ExcelExtractor
