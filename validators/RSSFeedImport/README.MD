# Flatfile RSS Feed Import Plugin

A Flatfile plugin for importing data from RSS feeds into Flatfile workbooks. This plugin automates the process of fetching RSS feed content and populating Flatfile sheets with the retrieved data.

## Features

- Import RSS feed data into Flatfile workbooks
- Scheduled automatic imports
- Custom action for manual imports
- Error handling and logging
- Import reporting
- Configurable RSS feed URL and import schedule

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-rss-import
```

## Example Usage

```javascript
import rssFeedImportPlugin from '@flatfile/plugin-rss-import';
import { FlatfileListener } from '@flatfile/listener';

const listener = new FlatfileListener();

listener.use(rssFeedImportPlugin({
  rssFeedUrl: 'https://example.com/rss-feed',
  importSchedule: '0 0 * * *'
}));

listener.mount();
```

## Configuration

The plugin accepts the following configuration options:

- `rssFeedUrl` (string): The URL of the RSS feed to import (default: 'https://example.com/rss-feed')
- `importSchedule` (string): A cron expression for scheduling automatic imports (default: '0 0 * * *', which runs daily at midnight)

## Behavior

1. **Manual Import**: The plugin registers a custom action "Import RSS Feed" that can be triggered manually from the Flatfile interface.

2. **Scheduled Import**: The plugin uses node-cron to schedule automatic imports based on the provided `importSchedule` configuration.

3. **RSS Parsing**: When an import is triggered, the plugin fetches and parses the RSS feed from the configured URL.

4. **Data Mapping**: The parsed RSS feed items are mapped to the following sheet columns:
   - title
   - link
   - pubDate
   - content

5. **Error Handling**: The plugin includes comprehensive error handling and logging for various scenarios.

6. **Reporting**: After each import, the plugin generates a report detailing the number of successfully imported entries and any import failures.

7. **Job Management**: The plugin uses Flatfile's job API to manage the import process, including acknowledging the job, updating progress, and completing or failing the job based on the outcome.

Note: Make sure to configure the necessary permissions and access to the Flatfile API for the plugin to function correctly.