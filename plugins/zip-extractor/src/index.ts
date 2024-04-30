import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'

import { Flatfile, FlatfileClient } from '@flatfile/api'
import { jobHandler } from '@flatfile/plugin-job-handler'
import { logInfo } from '@flatfile/util-common'
import { getFileBuffer } from '@flatfile/util-file-buffer'
import AdmZip from 'adm-zip'
import fs from 'fs'
import { asyncForEach } from 'modern-async'
import { tmpdir } from 'os'
import path from 'path'

const api = new FlatfileClient()
export interface PluginOptions {
  readonly debug?: boolean
}

export const ZipExtractor = (options: PluginOptions = {}) => {
  return (listener: FlatfileListener) => {
    listener.on('file:created', async (event) => {
      const { fileId } = event.context
      const { data: file } = await api.files.get(fileId)
      if (file.mode === 'export') {
        return
      }

      if (!file.name.endsWith('.zip')) {
        return
      }

      const jobs = await api.jobs.create({
        type: Flatfile.JobType.File,
        operation: 'extract-plugin-zip',
        status: Flatfile.JobStatus.Ready,
        source: fileId,
      })
      await api.jobs.execute(jobs.data.id)
    })
    listener.use(
      jobHandler(
        { operation: 'extract-plugin-zip' },
        async (
          event: FlatfileEvent,
          tick: (
            progress: number,
            message?: string
          ) => Promise<Flatfile.JobResponse>
        ) => {
          const { spaceId, environmentId } = event.context

          try {
            await tick(1, 'Unzipping file')
            const buffer = await getFileBuffer(event)
            const zip = new AdmZip(buffer)
            const zipEntries = zip
              .getEntries()
              .filter(
                (zipEntry) =>
                  !zipEntry.name.startsWith('.') &&
                  !zipEntry.entryName.startsWith('__MACOSX') &&
                  !zipEntry.isDirectory
              )
            const zipEntryCount = zipEntries.length

            await tick(10, 'Uploading files')
            let i = 0
            await asyncForEach(zipEntries, async (zipEntry) => {
              zip.extractEntryTo(zipEntry, tmpdir(), false, true)
              const filePath = path.join(tmpdir(), zipEntry.name)
              if (options.debug) {
                logInfo(
                  '@flatfile/plugin-zip-extractor',
                  `filePath ${filePath}`
                )
              }
              const stream = fs.createReadStream(filePath)
              await api.files.upload(stream, {
                spaceId,
                environmentId,
              })
              await fs.promises.unlink(filePath)
              await tick(
                10 + Math.round(((i + 1) / zipEntryCount) * 89),
                'File uploaded'
              )
              i++
            })

            return {
              outcome: {
                message: 'Extraction complete',
              },
            } as Flatfile.JobCompleteDetails
          } catch (e) {
            logInfo('@flatfile/plugin-zip-extractor', `error ${e}`)
            throw new Error(`Extraction failed ${e.message}`)
          }
        }
      )
    )
  }
}

/*
 * @deprecated use `ZipExtractor` instead
 */
export const zipExtractorPlugin = ZipExtractor
