import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { PluginOptions } from './plugin'

import { fileBuffer } from '@flatfile/util-file-buffer'
import { run } from './plugin'

/**
 * PDF extractor plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const pdfExtractorPlugin = (opts: PluginOptions) => {
  return (listener: FlatfileListener) => {
    listener.use(
      fileBuffer(
        '.pdf',
        async (
          fileResource: Flatfile.File_,
          buffer: Buffer,
          event: FlatfileEvent
        ) => {
          await run(event, fileResource, buffer, opts)
        }
      )
    )
  }
}
