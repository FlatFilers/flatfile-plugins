import { Flatfile } from '@flatfile/api'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'

export const TSVExtractor = (options?: {
  dynamicTyping?: boolean
  hasHeader?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
}) => {
  return DelimiterExtractor('\t', 'tsv', options)
}
