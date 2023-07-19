import { FlatfileListener } from '@flatfile/listener'
import { JSONExtractor } from './json.extractor'
import { UploadCompletedEvent } from '@flatfile/api/api'

export const jsonExtractorPlugin = (options?: { rawNumbers?: boolean }) => {
  return (client: FlatfileListener) => {
    client.on('file:created', (event) => {
      return new JSONExtractor(
        event as unknown as UploadCompletedEvent,
        options
      ).runExtraction()
    })
  }
}
