import type { FlatfileListener } from '@flatfile/listener'
import { fileBuffer } from '@flatfile/util-file-buffer'
import api from '@flatfile/api'
import * as fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { tmpdir } from 'os'
import { logInfo } from '@flatfile/util-common'

export interface PluginOptions {
  readonly debug?: boolean
}

export const ZipExtractor = (options: PluginOptions = {}) => {
  return (handler: FlatfileListener) => {
    handler.use(
      fileBuffer('.zip', async (file, buffer, event) => {
        const { spaceId, environmentId } = event.context
        const job = await api.jobs.create({
          type: 'file',
          operation: 'extract',
          status: 'ready',
          source: event.context.fileId,
        })
        try {
          await api.jobs.update(job.data.id, { status: 'executing' })
          await api.jobs.ack(job.data.id, {
            progress: 10,
            info: 'Unzipping file',
          })
          const zip = new AdmZip(buffer)
          if (options.debug) {
            logInfo('@flatfile/plugin-zip-extractor', `tmpdir ${tmpdir()}`)
          }
          const zipEntries = zip.getEntries()
          await api.jobs.ack(job.data.id, {
            progress: 50,
            info: 'Uploading files',
          })
          const uploadPromises = zipEntries.map(async (zipEntry) => {
            if (
              !zipEntry.name.startsWith('.') &&
              !zipEntry.entryName.startsWith('__MACOSX') &&
              !zipEntry.isDirectory
            ) {
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
            }
          })
          await Promise.all(uploadPromises)
          await api.jobs.complete(job.data.id, {
            info: 'Extraction complete',
          })
        } catch (e) {
          logInfo('@flatfile/plugin-zip-extractor', `error ${e}`)
          await api.jobs.fail(job.data.id, {
            info: `Extraction failed ${e.message}`,
          })
        }
      })
    )
  }
}

/*
 * @deprecated use `ZipExtractor` instead
 */
export const zipExtractorPlugin = ZipExtractor
