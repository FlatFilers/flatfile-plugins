import { Extractor } from '@flatfile/util-extractor'
import { parseBuffer, parseBufferStreaming } from './parser'
import { GetHeadersOptions } from '../constants/headerDetection.const'

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
 * @property {object} mergedCellOptions - the options for merged cell handling.
 * @property {boolean} cascadeRowValues - if true, cascade values down the dataset until a blank row, new value, or end of dataset.
 * @property {boolean} cascadeHeaderValues - if true, cascade values across the header rows until a blank column, new value, or end of dataset.
 */
export interface ExcelExtractorOptions {
  readonly raw?: boolean
  readonly rawNumbers?: boolean
  readonly dateNF?: string
  readonly headerDetectionOptions?: GetHeadersOptions
  readonly skipEmptyLines?: boolean
  readonly chunkSize?: number
  readonly parallel?: number
  readonly debug?: boolean
  readonly mergedCellOptions?: {
    acrossColumns?: {
      treatment: 'applyToAll' | 'applyToTopLeft' | 'coalesce' | 'concatenate'
      separator?: string
    }
    acrossRows?: {
      treatment: 'applyToAll' | 'applyToTopLeft' | 'coalesce' | 'concatenate'
      separator?: string
    }
    acrossRanges?: {
      treatment: 'applyToAll' | 'applyToTopLeft'
    }
  }
  readonly cascadeRowValues?: boolean
  readonly cascadeHeaderValues?: boolean
}

export const ExcelExtractor = (options?: ExcelExtractorOptions) => {
  return Extractor(
    /\.(xlsx?|xlsm|xlsb|xltx?|xltm)$/i,
    'excel',
    parseBufferStreaming,
    options
  )
}

export const excelParser = parseBuffer

/*
 * @deprecated use `ExcelExtractor` instead
 */
export const xlsxExtractorPlugin = ExcelExtractor
