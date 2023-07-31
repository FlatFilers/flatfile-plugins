import api, { Flatfile } from '@flatfile/api'
import path from 'path'
import { AbstractExtractor } from '@flatfile/plugin-extractor-utils'
import AdmZip from 'adm-zip'
import * as fs from 'fs'

export class ZipExtractor extends AbstractExtractor {
  private readonly _options: {
    //add if needed
  }

  constructor(
    public event: { [key: string]: any },
    public options?: {
      //add if needed
    }
  ) {
    super(event)
    this._options = { ...options }
  }

  public async runExtraction(): Promise<boolean> {
    const { spaceId, environmentId } = this.event.context
    const { data: file } = await this.api.files.get(this.fileId)

    if (file.ext !== 'zip') {
      return false
    }
    const job = await this.startJob('zip-extract')

    try {
      await this.api.jobs.update(job.id, { status: 'executing' })
      await this.api.jobs.ack(job.id, {
        progress: 10,
        info: 'Downloading file',
      })

      const buffer = await this.getFileBufferFromApi(job)

      await this.api.jobs.ack(job.id, { progress: 30, info: 'Unzipping' })

      const zip = new AdmZip(buffer)
      const zipEntries = zip.getEntries()

      await this.api.jobs.ack(job.id, {
        progress: 50,
        info: 'Uploading files',
      })

      zipEntries.forEach(async (zipEntry) => {
        if (!zipEntry.entryName.startsWith('.') && !zipEntry.isDirectory) {
          zip.extractEntryTo(zipEntry, path.join(__dirname, '../'), false, true)

          const filePath = path.join(__dirname, '../', zipEntry.name)
          const stream = fs.createReadStream(filePath)
          await api.files.upload(stream, {
            spaceId,
            environmentId,
          })
          fs.unlinkSync(filePath)
        }
      })

      await this.completeJob(job)
      return true
    } catch (e) {
      const message = (await this.api.jobs.get(job.id)).data.info
      await this.failJob(job, 'while ' + message)
      return false
    }
  }
}
