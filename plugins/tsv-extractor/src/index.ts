import { Flatfile } from '@flatfile/api'
import { DelimiterExtractor } from '@flatfile/plugin-delimiter-extractor'

export const TSVExtractor = (options?: {
  dynamicTyping?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return DelimiterExtractor('.tsv', { delimiter: '\t', ...options })
}
