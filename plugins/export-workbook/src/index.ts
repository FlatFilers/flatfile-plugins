import type { FlatfileEvent } from '@flatfile/listener'
import type { FlatfileTickFunction } from '../../record-hook/src'

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
    async (event: FlatfileEvent, tick: FlatfileTickFunction) =>
      await exportRecords(event, opts, tick)
  )
}

export { exportRecordsPlugin as exportWorkbookPlugin }
