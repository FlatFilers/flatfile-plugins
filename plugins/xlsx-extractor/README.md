## @flatfile/plugin-xlsx-extractor

A plugin for parsing .xlsx files in Flatfile.

### Overview

This plugin parses all Sheets in an XLSX file and extracts them into Flatfile.

<small class="font-semibold text-primary dark:text-primary-light">INSTALL</small><br/>
``npm i @flatfile/plugin-xlsx-extractor``

---

## Import

```bash
npm i @flatfile/plugin-xlsx-extractor
```

```ts
import { ExcelExtractor } from '@flatfile/plugin-xlsx-extractor'
```

## Usage

Listen for an XLSX file to be uploaded to Flatfile. The platform will then extract the file automatically. Once complete, the file will be ready for import in the Files area.

```ts
listener.on(['file:created'], (event) => {
  return new ExcelExtractor(event).runExtraction()
})
```

## Additional Options

The extractor can accept additional properties. Props will be passed along to the Sheet.js parsing engine.

```ts
listener.on(['file:created'], (event) => {
  return new ExcelExtractor(event, { rawNumbers: true }).runExtraction()
})
```

### Properties

<ParamField path="rawNumbers" type="boolean" optional>
  In Excel, you could have rounding or formatting on a number cell to only display say 2 decimal places.
   By default, Flatfile will just take the displayed decimal places versus the raw numbers. 
   Set this value to true to take the raw numbers and disregard how it’s displayed in Excel.
</ParamField>

