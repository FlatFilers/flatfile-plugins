import type { FlatfileListener } from '@flatfile/listener'
import { fileBuffer } from '@flatfile/util-file-buffer'
import { PluginOptions, run } from './plugin'

/**
 * PDF extractor plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const extractPDF = (opts: PluginOptions) => {
  return (listener: FlatfileListener) => {
    listener.use(
      fileBuffer('.pdf', async (fileResource, buffer, event) => {
        await run(event, fileResource, buffer, opts)
      })
    )
  }
}

/*
 * @deprecated use `extractPDF` instead
 */
export const pdfExtractorPlugin = extractPDF
