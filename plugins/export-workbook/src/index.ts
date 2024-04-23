import type { Flatfile } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import type { PluginOptions } from './plugin'

import { jobHandler } from '@flatfile/plugin-job-handler'
import { exportRecords } from './plugin'

/**
 * Export records plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const exportRecordsPlugin = (opts: PluginOptions = {}) => {
  return jobHandler(
    { job: opts.jobName || 'workbook:downloadWorkbook' },
    async (
      event: FlatfileEvent,
      tick: (
        progress: number,
        message?: string
      ) => Promise<Flatfile.JobResponse>
    ) => await exportRecords(event, opts, tick)
  )
}

export { exportRecordsPlugin as exportWorkbookPlugin }
