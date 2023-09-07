import { Flatfile } from '@flatfile/api'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'

/*
 * @deprecated
 */
export const PSVExtractor = (options?: {
  dynamicTyping?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
  chunkSize?: number
  parallel?: number
}) => {
  return DelimiterExtractor('.psv', { delimiter: '|', ...options })
}

/*
 * @deprecated
 */
export const psvExtractorPlugin = PSVExtractor
