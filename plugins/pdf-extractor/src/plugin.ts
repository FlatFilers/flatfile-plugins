import axios from 'axios'
import api, { Flatfile } from '@flatfile/api'
import { FlatfileEvent } from '@flatfile/listener'
import * as fs from 'fs-extra'
import * as R from 'remeda'

/**
 * Plugin config options.
 *
 * @property {string} apiKey - `pdftables.com` API key
 * @property {boolean} debug - show helpful messages useful for debugging (usage intended for development)
 */
export interface PluginOptions {
  readonly apiKey: string
  readonly debug?: boolean
}

export const run = async (
  event: FlatfileEvent,
  file: Flatfile.File_,
  buffer: Buffer,
  opts: PluginOptions
): Promise<void> => {
  const { environmentId, spaceId } = event.context

  if (file.ext !== 'pdf' || file.mode !== 'import') {
    return
  }

  if (R.isEmpty(opts.apiKey)) {
    return
  }

  try {
    const url: string = `https://pdftables.com/api?key=${opts.apiKey}&format=csv`
    const fileName: string = `${file.name.replace(
      '.pdf',
      ''
    )}(Converted PDF)-${currentEpoch()}.csv`

    const formData = new FormData()
    formData.append('file', new Blob([buffer]))

    const response = await axios.postForm(url, formData)

    if (response.status !== 200) return

    fs.writeFile(fileName, response.data, async (err: unknown) => {
      if (err) {
        logError('Error writing file to disk')
      }

      try {
        const reader = fs.createReadStream(fileName)

        await api.files.upload(reader, {
          spaceId,
          environmentId,
          mode: 'import',
        })

        reader.close()
      } catch (uploadError: unknown) {
        logError('Failed to upload PDF->CSV file')
        logError(JSON.stringify(uploadError, null, 2))
      }
    })
  } catch (convertError: unknown) {
    logError(JSON.stringify(convertError))
  }

  if (opts.debug) {
    logInfo('Done')
  }
}

const currentEpoch = (): string => {
  return `${Math.floor(Date.now() / 1000)}`
}

const logError = (msg: string): void => {
  console.error('[@flatfile/plugin-pdf-extractor]:[FATAL] ' + msg)
}

const logInfo = (msg: string): void => {
  console.log('[@flatfile/plugin-pdf-extractor]:[INFO] ' + msg)
}

const logWarn = (msg: string): void => {
  console.warn('[@flatfile/plugin-pdf-extractor]:[WARN] ' + msg)
}
