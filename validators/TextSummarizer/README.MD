# Flatfile Text Summarization Plugin

This plugin for Flatfile provides automatic text summarization capabilities using natural language processing. It leverages the compromise library to generate summaries and extract key phrases from content in specified fields.

## Features

- Automatic summarization of text content
- Extraction of key phrases
- Configurable summary length or percentage
- Custom field mapping for content, summary, and key phrases
- Error handling for missing content

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-text-summarization
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import textSummarization from "@flatfile/plugin-text-summarization";

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

## Configuration

The plugin accepts a configuration object with the following properties:

- `sheetSlug` (required): The slug of the sheet to apply the summarization to
- `contentField` (required): The field containing the full text content
- `summaryField` (required): The field where the generated summary will be stored
- `keyPhrasesField` (required): The field where extracted key phrases will be stored
- `summaryLength` (optional): The number of sentences to include in the summary (default: 2)
- `summaryPercentage` (optional): The percentage of original content to include in the summary
- `autoSummarize` (optional): Whether to automatically generate summaries (default: false)

## Behavior

1. The plugin checks for required configuration fields and throws an error if any are missing.
2. It processes each record in the specified sheet.
3. If `autoSummarize` is true and no existing summary is present:
   - It generates a summary based on the specified length or percentage.
   - If the content is shorter than the specified summary length, the entire content is used as the summary.
   - For longer content, it combines sentences from the beginning and end of the text.
   - Key phrases are extracted and stored in the specified field.
4. If the content field is empty, an error is added to the record.
5. The plugin uses a concurrency of 2 for processing records and includes debug information.

Note: This plugin requires the `@flatfile/listener`, `@flatfile/plugin-record-hook`, and `compromise` packages as dependencies.