# XLSX Extractor Plugin

This parses all Sheets in an XLSX file and extracts them into X with `@flatfile/api` version 1.4.8. Here's an example of how to use it:

```ts
import { EventTopic } from '@flatfile/api/api'

SpaceConfig1.on([EventTopic.FileCreated], (event) => {
  return new ExcelExtractor(event).runExtraction()
})
```
The Extractor can accept an addition options parameter that includes rawNumbers: boolean which will be passed along to the Sheet.js parsing engine.

```ts
SpaceConfig1.on([EventTopic.FileCreated], (event) => {
  return new ExcelExtractor(event, { rawNumbers: true }).runExtraction()
})
```