<!-- START_INFOCARD -->

The `@flatfile/plugin-import-rss` plugin automates the process of importing RSS feed data into Flatfile Sheets. It listens for and responds to job:ready events with the specified operation type, fetching RSS feed content and populating Flatfile sheets with the retrieved data. This plugin supports multiple RSS feeds and provides flexible configuration options.

**Event Type:** 
`job:ready`

**Supported RSS feed items:** 
title, link, pubDate, content, guid

<!-- END_INFOCARD -->

> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](https://flatfile.com/docs/orchestration/listeners#listener-types)

The `@flatfile/plugin-import-rss` plugin allows you to easily import RSS feed data into your Flatfile Sheets. It automates the process of fetching RSS content and populating Flatfile Sheets with the retrieved data.

## Parameters

The `rssImport` function accepts a configuration object with the following properties:

- `operation` (string): The operation name to listen for in the job:ready event.
- `feeds` (array): An array of feed configurations, each containing:
  - `sheetSlug` (string): The slug of the sheet to import RSS data into.
  - `rssFeedUrl` (string): The URL of the RSS feed to import data from.

## Usage

### Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-import-rss
```

### JavaScript

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { rssImport } from "@flatfile/plugin-import-rss";

const listener = new FlatfileListener();

listener.use(
  rssImport({
    operation: "importRSSFeed",
    feeds: [
      {
        sheetSlug: "rss_feed_data",
        rssFeedUrl: "https://example.com/rss-feed"
      }
    ]
  })
);

listener.mount();
```

### TypeScript

```typescript
import { rssImport, RSSImportConfig } from "@flatfile/plugin-import-rss";

listener.use(rssImport({
  operation: "importRSSFeed",
  feeds: [
    {
      sheetSlug: "rss_feed_data",
      rssFeedUrl: "https://example.com/rss-feed"
    }
  ]
}));
```

## Example Usage

Here's an example of how to use the plugin with multiple RSS feeds:

```typescript listener.ts
import type { FlatfileListener } from '@flatfile/listener';
import { rssImport } from "@flatfile/plugin-import-rss";

export default function (listener: FlatfileListener) {
  listener.use(
    rssImport({
      operation: "importRSSFeed",
      feeds: [
        {
          sheetSlug: "tech_news",
          rssFeedUrl: "https://techcrunch.com/feed/"
        },
        {
          sheetSlug: "world_news",
          rssFeedUrl: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
        }
      ]
    })
  );
}
```

## API Calls

The plugin uses the following Flatfile API calls:

- `api.sheets.get`
- `api.jobs.ack`
- `api.jobs.complete`
- `api.jobs.fail`
- `api.records.insert`

## Contributing

Contributions to this plugin are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them with clear, descriptive messages
4. Push your changes to your fork
5. Submit a pull request with a clear description of your changes

Please ensure your code adheres to the existing style and includes appropriate tests.