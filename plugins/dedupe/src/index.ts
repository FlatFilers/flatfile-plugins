import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { type TickFunction, jobHandler } from '@flatfile/plugin-job-handler'
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
        async (event: FlatfileEvent, tick: TickFunction) => {
          await dedupe(event, tick, opts)
        }
      )
    )
  }
}
