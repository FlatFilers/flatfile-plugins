import { FlatfileListener } from '@flatfile/listener'

import { PluginOptions, dedupe } from './plugin'

/**
 * Dedupe plugin for Flatfile.
 *
 * @param jobOperation - job operation to match on
 * @param opts - plugin config options
 */
export const dedupePlugin = (jobOperation: string, opts: PluginOptions) => {
  return (listener: FlatfileListener) => {
    listener.on('job:ready', { operation: jobOperation }, async (event) => {
      await dedupe(event, opts)
    })
  }
}
