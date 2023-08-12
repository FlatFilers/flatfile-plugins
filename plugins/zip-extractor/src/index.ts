import type { FlatfileListener } from '@flatfile/listener'
import { fileBuffer } from '@flatfile/util-file-buffer'
import api from '@flatfile/api'
import * as fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

export const ZipExtractor = () => {
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
          const zipEntries = zip.getEntries()
          await api.jobs.ack(job.data.id, {
            progress: 50,
            info: 'Uploading files',
          })
          zipEntries.forEach(async (zipEntry) => {
            if (
              !zipEntry.entryName.startsWith('__MACOSX') &&
              !zipEntry.entryName.startsWith('.') &&
              !zipEntry.entryName.match('.DS_Store') &&
              !zipEntry.isDirectory
            ) {
              zip.extractEntryTo(
                zipEntry,
                path.join(__dirname, '../'),
                false,
                true
              )

              const filePath = path.join(__dirname, '../', zipEntry.name)
              const stream = fs.createReadStream(filePath)
              await api.files.upload(stream, {
                spaceId,
                environmentId,
              })
              fs.unlinkSync(filePath)
            }
          })
          await api.jobs.complete(job.data.id, {
            info: 'Extraction complete',
          })
        } catch (e) {
          console.log(`error ${e}`)
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
