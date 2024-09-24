# Flatfile Sentiment Analysis Plugin

This plugin implements sentiment analysis for Flatfile using the RecordHook. It analyzes specified text fields in records, adds sentiment scores and categories as new fields, and provides informative messages about the analysis process.

## Features

- Analyzes sentiment of text fields in Flatfile records
- Adds sentiment scores and categories as new fields
- Provides configurable options for sheet selection and text field analysis
- Includes informative messages about the sentiment analysis process
- Supports automatic or manual sentiment analysis triggering

## Installation

To install the Flatfile Sentiment Analysis Plugin, use npm:

```bash
npm install @flatfile/plugin-sentiment-analysis
```

## Example Usage

```javascript
import { FlatfileRecord } from '@flatfile/hooks';
import sentimentAnalysisHook from '@flatfile/plugin-sentiment-analysis';

export default function flatfileEventListener(listener) {
  listener.use(sentimentAnalysisHook);
}
```

## Configuration

The plugin can be configured with the following options:

- `sheetSlug`: The slug of the sheet to apply sentiment analysis (default: "default-sheet")
- `textFields`: An array of field names to analyze for sentiment (default: ["description"])
- `autoAnalysis`: Boolean to enable/disable automatic sentiment analysis (default: true)

Example configuration:

```javascript
listener.use(
  sentimentAnalysisHook,
  {
    sheetSlug: "customer-feedback",
    textFields: ["comment", "feedback"],
    autoAnalysis: true
  }
);
```

## Behavior

1. The plugin checks if the current sheet matches the configured `sheetSlug`.
2. If `autoAnalysis` is enabled, it processes each specified text field:
   - Analyzes the sentiment of the text
   - Adds new fields with sentiment score and category
   - Adds an info message with sentiment analysis results
3. If a field is empty, it adds a warning message.
4. If `autoAnalysis` is disabled, it adds an info message stating that automatic analysis is off.

The sentiment analysis results are categorized as follows:
- Positive: score > 0
- Negative: score < 0
- Neutral: score = 0