import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import type { PluginOptions } from './dedupe.plugin'

import { jobHandler } from '@flatfile/plugin-job-handler'
import { dedupe } from './dedupe.plugin'

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
        async (
          event: FlatfileEvent,
          tick: (
            progress: number,
            message?: string
          ) => Promise<Flatfile.JobResponse>
        ) => {
          await dedupe(event, tick, opts)
        }
      )
    )
  }
}
