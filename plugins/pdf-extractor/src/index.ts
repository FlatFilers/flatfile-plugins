import { FlatfileListener } from '@flatfile/listener'
import { fileBuffer } from '@flatfile/plugin-file-buffer'

import { PluginOptions, run } from './plugin'

/**
 * PDF extractor plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const pdfExtractorPlugin = (opts: PluginOptions) => {
  return (listener: FlatfileListener) => {
    listener.use(
      fileBuffer('.pdf', async (fileResource, buffer, event) => {
        await run(event, fileResource, buffer, opts)
      })
    )
  }
}
