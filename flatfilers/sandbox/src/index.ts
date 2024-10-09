import type { FlatfileListener } from '@flatfile/listener'
import { rssImport } from '@flatfile/plugin-import-rss'
import { configureSpace } from '@flatfile/plugin-space-configure'
import { MarkdownExtractor } from '@flatfile/plugin-markdown-extractor'

export default async function (listener: FlatfileListener) {
  listener.use(
    rssImport([
      {
        sheetSlug: 'rss-feed-1',
        rssFeedUrl: 'http://rss.cnn.com/rss/money_topstories.rss',
      },
      {
        sheetSlug: 'rss-feed-2',
        rssFeedUrl: 'http://rss.cnn.com/rss/money_news_companies.rss',
      },
    ])
  )
  listener.use(
    configureSpace({
      workbooks: [
        {
          name: 'Sandbox',
          sheets: [
            {
              name: 'RSS Feed One',
              slug: 'rss-feed-1',
              fields: [
                {
                  key: 'title',
                  type: 'string',
                  label: 'Title',
                },
                {
                  key: 'link',
                  type: 'string',
                  label: 'Link',
                },
                {
                  key: 'pubDate',
                  type: 'string',
                  label: 'Pub Date',
                },
                {
                  key: 'content',
                  type: 'string',
                  label: 'Content',
                },
                {
                  key: 'guid',
                  type: 'string',
                  label: 'GUID',
                },
              ],
              actions: [
                {
                  operation: 'importRSSFeed',
                  label: 'Import RSS Feed',
                  description: 'Import data from an RSS feed into the workbook',
                  primary: true,
                  icon: 'rss_feed',
                  tooltip: 'Click to import data from an RSS feed',
                  mode: 'foreground',
                },
              ],
            },
            {
              name: 'RSS Feed Two',
              slug: 'rss-feed-2',
              fields: [
                {
                  key: 'title',
                  type: 'string',
                  label: 'Title',
                },
                {
                  key: 'link',
                  type: 'string',
                  label: 'Link',
                },
                {
                  key: 'pubDate',
                  type: 'string',
                  label: 'Pub Date',
                },
                {
                  key: 'content',
                  type: 'string',
                  label: 'Content',
                },
                {
                  key: 'guid',
                  type: 'string',
                  label: 'GUID',
                },
              ],
              actions: [
                {
                  operation: 'importRSSFeed',
                  label: 'Import RSS Feed',
                  description: 'Import data from an RSS feed into the workbook',
                  primary: true,
                  icon: 'rss_feed',
                  tooltip: 'Click to import data from an RSS feed',
                  mode: 'foreground',
                },
              ],
            },
          ],
        },
      ],
    })
  )

  listener.use(MarkdownExtractor())

}
