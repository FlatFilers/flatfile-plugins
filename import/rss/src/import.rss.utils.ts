import { FlatfileClient } from '@flatfile/api'
import { logError, logInfo } from '@flatfile/util-common'
import RSSParser from 'rss-parser'

const parser = new RSSParser()

export async function parseRSSFeed(url: string) {
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
      `Error parsing RSS feed: ${(error as Error).message}`
    )
    throw error
  }
}

export async function mapToSheetColumns(sheetId: string, records: any[]) {
  try {
    const formattedRecords = records.map((record) => ({
      title: { value: record.title, valid: true, messages: [] },
      link: { value: record.link, valid: true, messages: [] },
      pubDate: { value: record.pubDate, valid: true, messages: [] },
      content: { value: record.content, valid: true, messages: [] },
      guid: { value: record.guid, valid: true, messages: [] },
    }))

    const api = new FlatfileClient()

    await api.records.insert(sheetId, formattedRecords)
    logInfo(
      '@flatfile/plugin-rss-import',
      'Records successfully inserted into Flatfile sheet.'
    )
  } catch (error) {
    logError(
      '@flatfile/plugin-rss-import',
      `Error mapping records to sheet columns: ${(error as Error).message}`
    )
    throw error
  }
}
