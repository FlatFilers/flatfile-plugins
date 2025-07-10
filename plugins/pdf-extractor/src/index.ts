import type { FlatfileListener } from '@flatfile/listener'
import { fileBuffer, getFileBuffer } from '@flatfile/util-file-buffer'

import { PluginOptions, run } from './plugin'
import { Flatfile, FlatfileClient } from '@flatfile/api'

const api = new FlatfileClient()

/**
 * PDF extractor plugin for Flatfile.
 *
 * @param opts - plugin config options
 */
export const pdfExtractorPlugin = (opts: PluginOptions) => {
  return (listener: FlatfileListener) => {
    listener.on('file:created', async (event) => {
      const { fileId } = event.context
      const { data: file } = await api.files.get(fileId)
      const matchFile = '.pdf'
      if (file.mode === 'export') {
        return
      }

      if (typeof matchFile === 'string' && !file.name.endsWith(matchFile)) {
        return
      }

      const jobs = await api.jobs.create({
        type: Flatfile.JobType.File,
        operation: `extract-plugin-pdf-conversion`,
        status: Flatfile.JobStatus.Ready,
        source: fileId,
      })
      await api.jobs.execute(jobs.data.id)
    })

    listener.on(
      'job:ready',
      { operation: `extract-plugin-pdf-conversion` },
      async (event) => {
        const { fileId, jobId } = event.context
        await api.jobs.ack(jobId, {
          progress: 1,
          info: 'Starting PDF conversion',
        })
        const { data: file } = await api.files.get(fileId)
        if (file.mode === 'export') {
          return
        }
        getFileBuffer(event).then((buffer) => run(event, file, buffer, opts))
      }
    )
  }
}
