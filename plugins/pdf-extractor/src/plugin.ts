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
    logError('@flatfile/plugin-pdf-extractor', 'Found invalid API key')

    return
  }

  try {
    const url: string = `https://pdftables.com/api?key=${opts.apiKey}&format=csv`
    const fileName: string = `${file.name.replace(
      '.pdf',
      ''
    )} (Converted PDF)-${currentEpoch()}.csv`

    const formData = new FormData()
    formData.append('file', buffer, { filename: file.name })

    const fetchOptions = {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders(),
    }

    const response = await fetch(url, fetchOptions)

    if (response.status !== 200) {
      logError(
        '@flatfile/plugin-pdf-extractor',
        'Failed to convert PDF on pdftables.com'
      )
      return
    }

    const data = await response.text()

    fs.writeFile(fileName, data, async (err: unknown) => {
      if (err) {
        if (opts.debug) {
          logError(
            '@flatfile/plugin-pdf-extractor',
            'Error writing file to disk'
          )
        }

        return
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
        if (opts.debug) {
          logError(
            '@flatfile/plugin-pdf-extractor',
            'Failed to upload PDF->CSV file'
          )
        }

        logError(
          '@flatfile/plugin-pdf-extractor',
          JSON.stringify(uploadError, null, 2)
        )
      }
    })
  } catch (convertError: unknown) {
    logError(
      '@flatfile/plugin-pdf-extractor',
      JSON.stringify(convertError, null, 2)
    )
  }

  if (opts.debug) {
    logInfo('@flatfile/plugin-pdf-extractor', 'Done')
  }
}

const currentEpoch = (): string => {
  return `${Math.floor(Date.now() / 1000)}`
}
