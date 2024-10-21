<!-- START_INFOCARD -->

# @flatfile/plugin-extract-html-table

This plugin provides HTML table extraction capabilities for Flatfile. It parses HTML files and extracts structured data from tables, handling complex layouts and nested tables.

**Event Type:** `listener.on('file:created')`

**Supported File Types:** `.html`

<!-- END_INFOCARD -->

## Features

- Extracts table structure, including headers and cell data
- Handles nested tables and complex table layouts
- Handles colspan and rowspan attributes (configurable)
- Supports nested tables up to a configurable depth
- Converts extracted data into a structured format
- Provides error handling for malformed HTML or table structures
- Debug mode for detailed logging

## Parameters

#### `options` - `object` - (optional)

- `handleColspan` - `boolean` - (optional): Determines how to handle colspan. Default is true.
- `handleRowspan` - `boolean` - (optional): Determines how to handle rowspan. Default is true.
- `maxDepth` - `number` - (optional): Maximum depth for nested tables. Default is 3.
- `debug` - `boolean` - (optional): Enables debug logging. Default is false.

## API Calls

- `api.files.download`
- `api.files.update`

## Usage

**install**
```bash
npm install @flatfile/plugin-extract-html-table
```

**listener.js**
```javascript
import { extractHTMLTable } from '@flatfile/plugin-extract-html-table';

export default function (listener) {
  listener.use(
    extractHTMLTable({
      handleColspan: true,
      handleRowspan: true,
      maxDepth: 3,
      debug: false
    })
  );

  // ...the rest of your listener...
}
```
