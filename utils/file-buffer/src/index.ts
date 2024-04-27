import type { Flatfile } from '@flatfile/api'
import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'

const api = new FlatfileClient()

export const fileBuffer = (
  matchFile: string | RegExp,
  callback: (
    file: Flatfile.File_,
    buffer: Buffer,
    event: FlatfileEvent
  ) => Promise<void> | void
) => {
  return (listener: FlatfileListener) => {
    listener.on('file:created', async (event) => {
      const { data: file } = await api.files.get(event.context.fileId)
      if (file.mode === 'export') {
        return
      }

      if (typeof matchFile === 'string' && !file.name.endsWith(matchFile)) {
        return
      }

      if (matchFile instanceof RegExp && !matchFile.test(file.name)) {
        return
      }

      getFileBuffer(event).then((buffer) => callback(file, buffer, event))
    })
  }
}

export async function getFileBuffer(event: FlatfileEvent): Promise<Buffer> {
  const file = await api.files.download(event.context.fileId)

  const chunks: Buffer[] = []
  // node.js readable streams implement the async iterator protocol
  for await (const chunk of file) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}
