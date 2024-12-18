import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { FlatfileTickFunction } from '../../record-hook/src'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { PluginOptions, dedupe } from './dedupe.plugin'

/**
 * Dedupe plugin for Flatfile.
 *
 * @param jobOperation - job operation to match on
 * @param opts - plugin config options
 */
export const dedupePlugin = (jobOperation: string, opts: PluginOptions) => {
  return (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        { operation: jobOperation },
        async (event: FlatfileEvent, tick: FlatfileTickFunction) => {
          await dedupe(event, tick, opts)
        }
      )
    )
  }
}
