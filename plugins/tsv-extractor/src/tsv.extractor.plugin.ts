import { FlatfileListener } from '@flatfile/listener'
import { TsvExtractor } from './tsv.extractor'
import { UploadCompletedEvent } from '@flatfile/api/api'

export const tsvExtractorPlugin = (options?: {}) => {
  return (client: FlatfileListener) => {
    client.on('file:created', (event) => {
      return new TsvExtractor(
        event as unknown as UploadCompletedEvent,
        options
      ).runExtraction()
    })
  }
}
