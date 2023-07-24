import { FlatfileListener } from '@flatfile/listener'
import { ZipExtractor } from './zip.extractor'
import { UploadCompletedEvent } from '@flatfile/api/api'

export const zipExtractorPlugin = (options?: {}) => {
  return (client: FlatfileListener) => {
    client.on('file:created', (event) => {
      return new ZipExtractor(
        event as unknown as UploadCompletedEvent,
        options
      ).runExtraction()
    })
  }
}
