<!-- START_INFOCARD -->

# @flatfile/plugin-enrich-summarize

This plugin provides automatic text summarization capabilities for Flatfile using natural language processing. It uses the compromise library to generate summaries and extract key phrases from specified fields.

**Event Type:** `listener.on('commit:created')`

**Supported Field Types:** `string`

<!-- END_INFOCARD -->

## Features

- Automatic text summarization
- Key phrase extraction
- Configurable summary length or percentage
- Custom field mapping for content, summary, and key phrases
- Error handling for missing content

## Parameters

#### `sheetSlug` - `string` - (required)
The slug of the sheet to apply summarization.

#### `contentField` - `string` - (required)
The field containing the full text content.

#### `summaryField` - `string` - (required)
The field to store the generated summary.

#### `keyPhrasesField` - `string` - (required)
The field to store extracted key phrases.

#### `summaryLength` - `number` - (optional)
Number of sentences in the summary. Default is 2.

#### `summaryPercentage` - `number` - (optional)
Percentage of content to include in summary.

#### `autoSummarize` - `boolean` - (optional)
Automatically generate summaries. Default is false.

## Usage

**install**
```bash
npm install @flatfile/plugin-enrich-summarize
```

**import**
```javascript
import { FlatfileListener } from "@flatfile/listener";
import { textSummarization } from "@flatfile/plugin-enrich-summarize";
```

**listener.js**
```javascript
const listener = new FlatfileListener();

listener.use(
  textSummarization({
    sheetSlug: "articles",
    contentField: "full_text",
    summaryField: "summary",
    keyPhrasesField: "key_phrases",
    summaryLength: 3,
    autoSummarize: true
  })
);
```
