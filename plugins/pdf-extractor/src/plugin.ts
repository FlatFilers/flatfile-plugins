import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent } from '@flatfile/listener'
import { logError, logInfo } from '@flatfile/util-common'
import fetch from 'cross-fetch'
import FormData from 'form-data'
import * as fs from 'fs-extra'
import * as R from 'remeda'

const api = new FlatfileClient()
export interface PluginOptions {
  readonly apiKey: string
  readonly format?: 'csv' | 'xlsx-single' | 'xlsx-multiple' | 'csv' | 'html'
  readonly debug?: boolean
}

export const run = async (
  event: FlatfileEvent,
  file: Flatfile.File_,
  buffer: Buffer,
  opts: PluginOptions
): Promise<void> => {
  const { environmentId, spaceId, jobId } = event.context

  const tick = async (progress: number, info?: string) => {
    await api.jobs.ack(jobId, { progress, info })
    if (opts.debug) {
      console.log(`Job progress: ${progress}, Info: ${info}`)
    }
  }

  if (file.ext !== 'pdf' || file.mode !== 'import') {
    return
  }

  if (R.isEmpty(opts.apiKey)) {
    logError('@flatfile/plugin-pdf-extractor', 'Found invalid API key')

    return
  }
  const format = opts.format || 'csv'
  try {
    const url: string = `https://pdftables.com/api?key=${opts.apiKey}&format=${format}`
    const cleanFormat = format.includes('xlsx') ? 'xlsx' : format
    const fileName: string = `${file.name.replace(
      '.pdf',
      ''
    )} (Converted PDF)-${currentEpoch()}.${cleanFormat}`

    const formData = new FormData()
    formData.append('file', buffer, { filename: file.name })
    await tick(10, `Converting PDF to ${cleanFormat.toUpperCase()}`)
    const fetchOptions = {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    }

    const response = await fetch(url, fetchOptions)

    if (response.status !== 200) {
      logError(
        '@flatfile/plugin-pdf-extractor',
        `Failed to convert PDF to ${cleanFormat.toUpperCase()}`
      )
      console.log(response)
      await api.jobs.fail(jobId, {
        info: `Failed to convert PDF to ${cleanFormat.toUpperCase()}`,
      })
      return
    }

    const data = await response.text()
    await tick(50, 'Writing file to disk')
    fs.writeFile(fileName, data, async (err: unknown) => {
      if (err) {
        if (opts.debug) {
          logError(
            '@flatfile/plugin-pdf-extractor',
            'Error writing file to disk'
          )
        }
        await api.jobs.fail(jobId, {
          info: `Failed writing file to disk`,
        })
        return
      }

      try {
        const reader = fs.createReadStream(fileName)
        await tick(90, 'Uploading file to Flatfile')
        await api.files.upload(reader, {
          spaceId,
          environmentId,
          mode: 'import',
        })

        reader.close()
      } catch (uploadError: unknown) {
        await api.jobs.fail(jobId, {
          info: `Failed to upload ${cleanFormat.toUpperCase()} file`,
        })
        if (opts.debug) {
          logError(
            '@flatfile/plugin-pdf-extractor',
            `Failed to upload ${cleanFormat.toUpperCase()} file`
          )
        }

        logError(
          '@flatfile/plugin-pdf-extractor',
          JSON.stringify(uploadError, null, 2)
        )
      }
    })
  } catch (convertError: unknown) {
    await api.jobs.fail(jobId, {
      info: JSON.stringify(convertError, null, 2),
    })
    logError(
      '@flatfile/plugin-pdf-extractor',
      JSON.stringify(convertError, null, 2)
    )
  }
  await tick(99)
  if (opts.debug) {
    logInfo('@flatfile/plugin-pdf-extractor', 'Done')
  }
  await api.jobs.complete(jobId, {
    info: 'PDF conversion complete',
  })
}

const currentEpoch = (): string => {
  return `${Math.floor(Date.now() / 1000)}`
}
