import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'

export const columnCopierPlugin = (listener: FlatfileListener) => {
  listener.on('job:ready', async (event: FlatfileEvent) => {
    const { jobId, workbookId, sheetId } = event.context
    const { operation, source, target } = event.payload

    if (operation !== 'copy-columns') {
      console.log(`Job ${jobId} is not a copy-columns operation. Skipping.`)
      return
    }

    if (!source || !target) {
      console.error(`Job ${jobId} is missing source or target column information.`)
      return
    }

    try {
      const records = await event.api.records.get(workbookId, sheetId)

      const updatedRecords = records.map(record => ({
        ...record,
        values: {
          ...record.values,
          [target]: record.values[source]
        }
      }))

      await event.api.records.update(workbookId, sheetId, updatedRecords)

      console.log(`Successfully copied data from ${source} to ${target} in sheet ${sheetId}`)
    } catch (error) {
      console.error(`Error in column-copier plugin: ${error}`)
    }
  })
}

export default columnCopierPlugin
