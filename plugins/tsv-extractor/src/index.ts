import { Flatfile } from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'

/*
 * @deprecated
 */
export const TSVExtractor = (options?: {
  dynamicTyping?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return (listener: FlatfileListener) => {
    console.log(
      'The TSVExtractor plugin is deprecated. TSV extraction is now natively supported by the Flatfile Platform.'
    )
  }
}
