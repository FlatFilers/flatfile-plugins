import { FlatfileListener, FlatfileEvent } from '@flatfile/listener'
import api from '@flatfile/api'
import { logInfo, logError } from '@flatfile/util-common'
import axios from 'axios'
import RSSParser from 'rss-parser'
import cron from 'node-cron'

const parser = new RSSParser()

const rssFeedImportAction = {
  operation: 'importRSSFeed',
  label: 'Import RSS Feed',
  description: 'Import data from an RSS feed into the workbook',
  primary: true,
  confirm: true,
  icon: 'rss_feed',
  tooltip: 'Click to import data from an RSS feed',
  mode: 'foreground',
  constraints: [{ type: 'hasData' }],
}

async function parseRSSFeed(url: string) {
  try {
    const feed = await parser.parseURL(url)
    return feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.content,
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

function createErrorHandler(errorCallback: (event: FlatfileEvent) => void) {
  return (handler: any) => {
    handler.on('error', (event: FlatfileEvent) => {
      logError(
        '@flatfile/plugin-rss-import',
        `An error occurred: ${JSON.stringify(event.payload)}`
      )
      errorCallback(event)
    })
  }
}

function generateReport(sheets: any[]) {
  return sheets.map((sheet) => ({
    sheetName: sheet.name,
    importedEntries: sheet.records.filter(
      (record: any) => record.status === 'imported'
    ),
    importFailures: sheet.records.filter(
      (record: any) => record.status === 'failed'
    ),
  }))
}

async function sendReport(report: any) {
  // Implement your report sending or saving logic here
  logInfo(
    '@flatfile/plugin-rss-import',
    `Import Report: ${JSON.stringify(report, null, 2)}`
  )
}

export default function rssFeedImportPlugin(config: any) {
  return (listener: FlatfileListener) => {
    listener.use(
      createErrorHandler((event: FlatfileEvent) => {
        logError(
          '@flatfile/plugin-rss-import',
          `Error in RSS Feed Import: ${JSON.stringify(event.payload)}`
        )
      })
    )

    listener.on(
      'job:ready',
      { job: 'workbook:importRSSFeed' },
      async (event: FlatfileEvent) => {
        const { jobId, workbookId } = event.context
        try {
          await api.jobs.ack(jobId, {
            info: 'Starting job to import RSS feed data',
            progress: 10,
          })

          const rssFeedUrl = config.rssFeedUrl || 'https://example.com/rss-feed'
          const records = await parseRSSFeed(rssFeedUrl)

          const { data: workbook } = await api.workbooks.get(workbookId)
          const { data: sheets } = await api.sheets.list({ workbookId })

          for (const sheet of sheets) {
            await mapToSheetColumns(sheet.id, records)
          }

          const report = generateReport(sheets)
          await sendReport(report)

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

    // Schedule regular imports
    cron.schedule(config.importSchedule || '0 0 * * *', async () => {
      logInfo('@flatfile/plugin-rss-import', 'Scheduled import job started')
      // Trigger the import job
      await api.jobs.create({
        type: 'workbook:importRSSFeed',
        operation: rssFeedImportAction.operation,
      })
    })
  }
}

// Register the action
api.actions.create({
  ...rssFeedImportAction,
  // Add other necessary properties
})
