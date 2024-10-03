import { FlatfileClient } from '@flatfile/api'
import type { FlatfileEvent, FlatfileListener } from '@flatfile/listener'
import { logError, logInfo } from '@flatfile/util-common'
import RSSParser from 'rss-parser'

const api = new FlatfileClient()

const parser = new RSSParser()

async function parseRSSFeed(url: string) {
  try {
    const feed = await parser.parseURL(url)
    return feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.content,
      guid: item.guid,
    }))
  } catch (error) {
    logError(
      '@flatfile/plugin-rss-import',
      `Error parsing RSS feed: ${error.message}`
    )
    throw error
  }
}

async function mapToSheetColumns(sheetId: string, records: any[]) {
  try {
    const formattedRecords = records.map((record) => ({
      title: { value: record.title, valid: true, messages: [] },
      link: { value: record.link, valid: true, messages: [] },
      pubDate: { value: record.pubDate, valid: true, messages: [] },
      content: { value: record.content, valid: true, messages: [] },
      guid: { value: record.guid, valid: true, messages: [] },
    }))

    await api.records.insert(sheetId, formattedRecords)
    logInfo(
      '@flatfile/plugin-rss-import',
      'Records successfully inserted into Flatfile sheet.'
    )
  } catch (error) {
    logError(
      '@flatfile/plugin-rss-import',
      `Error mapping records to sheet columns: ${error.message}`
    )
    throw error
  }
}

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

          const records = await parseRSSFeed(sheetConfig.rssFeedUrl)
          await mapToSheetColumns(sheetId, records)

          await api.jobs.complete(jobId, {
            outcome: { message: 'RSS feed data imported successfully' },
          })
        } catch (error) {
          await api.jobs.fail(jobId, {
            outcome: {
              message: `Failed to import RSS feed data: ${error.message}`,
            },
          })
        }
      }
    )
  }
}
