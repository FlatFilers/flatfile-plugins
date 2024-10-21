import { Extractor } from '@flatfile/util-extractor'
import { GetHeadersOptions } from './header.detection'
import { parseBuffer } from './parser'

/**
 * Plugin config options.
 *
 * @property {boolean} raw - if true, return raw data; if false, return formatted text.
 * @property {boolean} rawNumbers - if true, return raw numbers; if false, return formatted numbers.
 * @property {string} dateNF - the date format.
 * @property {number} chunkSize - the size of chunk to process when inserting records.
 * @property {number} parallel - the quantity of parallel process when inserting records.
 * @property {GetHeadersOptions} headerDetectionOptions - the options for header detection.
 * @property {boolean} skipEmptyLines - if true, skip empty lines; if false, include empty lines.
 * @property {boolean} debug - if true, display helpful console logs.
 */
export interface extractExcelOptions {
  readonly raw?: boolean
  readonly rawNumbers?: boolean
  readonly dateNF?: string
  readonly headerDetectionOptions?: GetHeadersOptions
  readonly skipEmptyLines?: boolean
  readonly chunkSize?: number
  readonly parallel?: number
  readonly debug?: boolean
}

export const extractExcel = (options?: extractExcelOptions) => {
  return Extractor(
    /\.(xlsx?|xlsm|xlsb|xltx?|xltm)$/i,
    'excel',
    parseBuffer,
    options
  )
}

export const excelParser = parseBuffer

/*
 * @deprecated use `extractExcel` instead
 */
export const xlsxExtractorPlugin = extractExcel

/*
 * @deprecated use `extractExcel` instead
 */
export const ExcelExtractor = extractExcel
