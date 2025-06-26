import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { type TickFunction, jobHandler } from '@flatfile/plugin-job-handler'
import { PluginOptions, merge } from './merge.plugin'

export const mergePlugin = (jobOperation: string, opts: PluginOptions) => {
  return (listener: FlatfileListener) => {
    listener.use(
      jobHandler(
        { operation: jobOperation },
        async (event: FlatfileEvent, tick: TickFunction) => {
          await merge(event, tick, opts)
        }
      )
    )
  }
}

export * from './merge.plugin'
