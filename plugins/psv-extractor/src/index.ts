import { Flatfile } from '@flatfile/api'

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
  console.log(
    'This plugin is deprecated. PSV extraction is now natively supported by the Flatfile Platform.'
  )
}

/*
 * @deprecated
 */
export const psvExtractorPlugin = PSVExtractor
