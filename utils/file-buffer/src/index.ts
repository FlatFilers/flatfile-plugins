import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import api, { Flatfile } from '@flatfile/api'

export const fileBuffer = (
  matchFile: string | RegExp,
  callback: (
    file: Flatfile.File_,
    buffer: Buffer,
    event: FlatfileEvent
  ) => Promise<void> | void
) => {
  return (listener: FlatfileListener) => {
    listener.on('upload:completed', async (event) => {
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
  const file = await api.files.download(event.context.fileId)

  const chunks: Buffer[] = []
  // node.js readable streams implement the async iterator protocol
  for await (const chunk of file) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}
