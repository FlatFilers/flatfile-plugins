import { FlatfileListener } from '@flatfile/listener'
import { PluginOptions, exportRecords } from './plugin'

/**
 * Export records plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const exportRecordsPlugin = (job, opts: PluginOptions = {}) => {
  return (listener: FlatfileListener) => {
    listener.on('job:ready', job, async (event) => {
      await exportRecords(event, opts)
    })
  }
}
