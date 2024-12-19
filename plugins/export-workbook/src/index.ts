import type { FlatfileEvent } from '@flatfile/listener'
import type { TickFunction } from '@flatfile/plugin-job-handler'

import { jobHandler } from '@flatfile/plugin-job-handler'
import { PluginOptions, exportRecords } from './plugin'

/**
 * Export records plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const exportRecordsPlugin = (opts: PluginOptions = {}) => {
  return jobHandler(
    { job: opts.jobName || 'workbook:downloadWorkbook' },
    async (event: FlatfileEvent, tick: TickFunction) =>
      await exportRecords(event, opts, tick)
  )
}

export { exportRecordsPlugin as exportWorkbookPlugin }
