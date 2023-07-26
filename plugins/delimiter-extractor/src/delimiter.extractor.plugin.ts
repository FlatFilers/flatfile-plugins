import { FlatfileListener } from '@flatfile/listener'
import { DelimiterExtractor } from './delimiter.extractor'
import { UploadCompletedEvent } from '@flatfile/api/api'

export const delimiterExtractorPlugin = (
  delimiter: string,
  fileExt: string,
  options?: {}
) => {
  return (client: FlatfileListener) => {
    client.on('file:created', (event) => {
      return new DelimiterExtractor(
        event as unknown as UploadCompletedEvent,
        delimiter,
        fileExt,
        options
      ).runExtraction()
    })
  }
}
