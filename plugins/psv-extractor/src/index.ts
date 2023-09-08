import { Flatfile } from '@flatfile/api'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'

export const PSVExtractor = (options?: {
  dynamicTyping?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return DelimiterExtractor('.psv', { delimiter: '|', ...options })
}

/*
 * @deprecated use `PSVExtractor` instead
 */
export const psvExtractorPlugin = PSVExtractor
