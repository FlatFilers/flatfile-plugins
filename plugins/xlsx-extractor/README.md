# @flatfile/plugin-xlsx-extractor

This package parses all Sheets in an XLSX file and extracts them into Flatfile.

## Installing Plugin

Install using `npm`:

`npm i @flatfile/plugin-xlsx-extractor`

or `yarn`:

`yarn add @flatfile/plugin-xlsx-extractor`

## Starter Code Example

``` typescript
import { xlsxExtractorPlugin } from "@flatfile/plugin-xlsx-extractor";

export default function(listener) {
  listener.on("**", (event) => {
    console.log(`-> My event listener received an event: ${JSON.stringify(event)}`);
  });

  //...other listeners

  listener.use(xlsxExtractorPlugin());
}
```

You can read more [here](https://flatfile.com/docs/plugins/extractors/xlsx-extractor).
