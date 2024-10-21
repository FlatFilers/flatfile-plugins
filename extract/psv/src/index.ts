import type { Flatfile } from '@flatfile/api'
import type { FlatfileListener } from '@flatfile/listener'

/*
 * @deprecated
 */
export const PSVExtractor = (options?: {
  dynamicTyping?: boolean
  skipEmptyLines?: boolean | 'greedy'
  transform?: (value: any) => Flatfile.CellValueUnion
  chunkSize?: number
  parallel?: number
  debug?: boolean
}) => {
  return (listener: FlatfileListener) => {
    console.log(
      'The PSVExtractor plugin is deprecated. PSV extraction is now natively supported by the Flatfile Platform.'
    )
  }
}

/*
 * @deprecated
 */
export const psvExtractorPlugin = PSVExtractor
