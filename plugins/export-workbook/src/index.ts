import type { FlatfileListener } from '@flatfile/listener'
import { PluginOptions, exportRecords } from './plugin'

/**
 * Export records plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const exportRecordsPlugin = (opts: PluginOptions = {}) => {
  return (listener: FlatfileListener) => {
    listener.on(
      'job:ready',
      { job: opts.jobName || 'workbook:downloadWorkbook' },
      async (event) => {
        await exportRecords(event, opts)
      }
    )
  }
}

export { exportRecordsPlugin as exportWorkbookPlugin }
