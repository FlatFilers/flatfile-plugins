import type { Client, FlatfileEvent } from '@flatfile/listener'
import fetch from 'node-fetch'
import api, { Flatfile } from '@flatfile/api'

export const fileBuffer = (
  matchFile: string | RegExp,
  callback: (
    file: Flatfile.File_,
    buffer: Buffer,
    event: FlatfileEvent
  ) => Promise<void> | void
) => {
  return (client: Client) => {
    client.on('file:created', async (event) => {
      const { data: file } = await api.files.get(event.context.fileId)

      if (typeof matchFile === 'string' && !file.name.endsWith(matchFile)) {
        return false
      }

      if (matchFile instanceof RegExp && !matchFile.test(file.name)) {
        return false
      }

      return getFileBuffer(event).then((buffer) => {
        return callback(file, buffer, event)
      })
    })
  }
}

async function getFileBuffer(event: FlatfileEvent): Promise<Buffer> {
  const file = await fetch(
    `${process.env.AGENT_INTERNAL_URL}/v1/files/${event.context.fileId}/download`,
    {
      method: 'GET',
      headers: {
        authorization: `Bearer ${process.env.FLATFILE_BEARER_TOKEN}`,
      },
    }
  )
  return await file.buffer()
}
