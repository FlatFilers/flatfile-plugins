import { Flatfile } from '@flatfile/api'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'

export const PSVExtractor = (options?: {
  dynamicTyping?: boolean
  hasHeader?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
}) => {
  return DelimiterExtractor('.psv', { delimiter: '|', ...options })
}

export const psvExtractorPlugin = PSVExtractor
