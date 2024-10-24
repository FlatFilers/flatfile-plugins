import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { mapToSheetColumns, parseRSSFeed } from './import.rss.utils'

const api = new FlatfileClient()

export interface RSSImportConfig {
  operation: string
  feeds: {
    sheetSlug: string
    rssFeedUrl: string
  }[]
}

export function rssImport(config: RSSImportConfig) {
  return (listener: FlatfileListener) => {
    listener.on(
      'job:ready',
      { job: `sheet:${config.operation}` },
      async (event: FlatfileEvent) => {
        const { jobId, sheetId } = event.context
        try {
          const { data: sheet } = await api.sheets.get(sheetId)

          const sheetConfig = config.feeds.find(
            (c) => c.sheetSlug === sheet.slug
          )

          await api.jobs.ack(jobId, {
            info: 'Starting job to import RSS feed data',
            progress: 10,
          })

          const records = await parseRSSFeed(sheetConfig!.rssFeedUrl)
          await mapToSheetColumns(sheetId, records)

          await api.jobs.complete(jobId, {
            outcome: { message: 'RSS feed data imported successfully' },
          })
        } catch (error) {
          await api.jobs.fail(jobId, {
            outcome: {
              message: `Failed to import RSS feed data: ${(error as Error).message}`,
            },
          })
        }
      }
    )
  }
}
