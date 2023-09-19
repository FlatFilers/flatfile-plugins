import { FlatfileListener } from '@flatfile/listener'
import { PluginOptions, run } from './plugin'

/**
 * Workbook export plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const exportWorkbookPlugin = (opts: PluginOptions = {}) => {
  return (listener: FlatfileListener) => {
    listener.on(
      'job:ready',
      { job: 'workbook:downloadWorkbook' },
      async (event) => {
        await run(event, opts)
      }
    )
  }
}
