<!-- START_INFOCARD -->

The `@flatfile/plugin-xlsx-extractor` plugin is designed to extract structured data from Excel files. It utilizes various libraries to parse Excel files and retrieve the structured data efficiently.

**Event Type:** 
`listener.on('file:created')`

**Supported file types:** 
`.xls`, `.xlsx`, `.xlsm`, `.xlsb`, `.xltx`, `.xltm`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

#### `raw` - `boolean` 
In Excel, you could have formatting on a text cell (i.e. date formatting). By
default, Flatfile will just take the formatted text versus the raw values. Set
this value to true to take the raw values and disregard how it's displayed in
Excel.

#### `rawNumbers` - `boolean`
In Excel, you could have rounding or formatting on a number cell to only
display say 2 decimal places. By default, Flatfile will just take the
displayed decimal places versus the raw numbers. Set this value to true to
take the raw numbers and disregard how it's displayed in Excel.


#### `dateNF` - `string` - (optional)
The `dateNF` parameter allows you to specify the date format for parsing
dates. (i.e. `yyyy-mm-dd`)


#### `chunkSize` - `default: "10_000"` - `number` - (optional)
The `chunkSize` parameter allows you to specify the quantity of records to in
each chunk.


#### `parallel` - `default: "1"` - `number` - (optional)
The `parallel` parameter allows you to specify the number of chunks to process
in parallel.


#### `headerDetectionOptions` - `Object` - (optional)
The `headerDetectionOptions` parameter allows you to specify the options for
detecting headers in the file. By default, the first 10 rows are scanned for
the row with the most non-empty cells.


#### `skipEmptyLines` - `default: "false"` - `boolean` - (optional)
The `skipEmptyLines` parameter allows you to specify if empty lines should be
skipped. By default, empty lines are included.

#### `debug` - `default: "false"` - `boolean` - (optional)
The `debug` parameter lets you toggle on/off helpful debugging messages for
development purposes.

#### `cascadeRowValues` - `default: "false"` - `boolean` - (optional)
The `cascadeRowValues` parameter automatically cascades values down the dataset until a blank row, new value, or end of dataset. This is useful for hierarchical data where values in a column apply to multiple rows below them.

#### `cascadeHeaderValues` - `default: "false"` - `boolean` - (optional)
The `cascadeHeaderValues` parameter automatically cascades values across the header rows until a blank column, new value, or end of dataset. This is useful for multi-level headers where a header value applies to multiple columns.

#### `mergedCellOptions` - `Object` - (optional)
The `mergedCellOptions` parameter allows you to specify how merged cells should be handled during extraction. You can define different treatments for cells merged across columns, rows, or ranges.

##### Merged Cell Vectors

- `acrossColumns`: Applies to cells merged horizontally (across multiple columns in the same row)
- `acrossRows`: Applies to cells merged vertically (across multiple rows in the same column)
- `acrossRanges`: Applies to cells merged both horizontally and vertically (across multiple rows and columns)

##### Treatment Options

For all vectors:
- `applyToAll`: Applies the merged cell value to all cells in the un-merged range
- `applyToTopLeft`: Applies the merged cell value only to the top-left cell in the un-merged range

For `acrossColumns` and `acrossRows` only:
- `coalesce`: Keeps only the first row/column and removes other rows/columns
- `concatenate`: Combines values from all cells using a separator (requires `separator` parameter)

Example configuration:
```js
mergedCellOptions: {
  acrossColumns: {
    treatment: 'concatenate',
    separator: ', '
  },
  acrossRows: {
    treatment: 'applyToAll'
  },
  acrossRanges: {
    treatment: 'applyToTopLeft'
  }
}
```



## API Calls

- `api.files.download`
- `api.files.get`
- `api.files.update`
- `api.jobs.ack`
- `api.jobs.complete`
- `api.jobs.create`
- `api.jobs.fail`
- `api.jobs.update`
- `api.records.insert`
- `api.workbooks.create`



## Usage

Listen for an Excel file (all extensions supported) to be uploaded to Flatfile. The platform will then extract the file automatically. Once complete, the file will be ready for import in the Files area.

```bash install
npm i @flatfile/plugin-xlsx-extractor
```

```js import
import { ExcelExtractor } from "@flatfile/plugin-xlsx-extractor";
```

**listener.js**

```js listener.js
listener.use(ExcelExtractor());
```

**Additional options**  

```js additional options
listener.use(ExcelExtractor({ 
  raw: true, 
  rawNumbers: true,
  cascadeRowValues: true,
  cascadeHeaderValues: true,
  mergedCellOptions: {
    acrossColumns: {
      treatment: 'concatenate',
      separator: ', '
    },
    acrossRows: {
      treatment: 'applyToAll'
    },
    acrossRanges: {
      treatment: 'applyToTopLeft'
    }
  }
}));
```


### Header Detection

Three detection options are provided for detecting headers in the file: `default`, `explicitHeaders`, and `specificRows`. By default, the first 10 rows are scanned for the row with the most non-empty cells. This row is then used as the header row.

#### Default

It looks at the first `rowsToSearch` rows and takes the row
with the most non-empty cells as the header, preferring the earliest
such row in the case of a tie.

```js
listener.use(ExcelExtractor());
// or...
listener.use(
  ExcelExtractor({
    headerDetectionOptions: {
      algorithm: "default",
      rowsToSearch: 30, // Default is 10
    },
  })
);
```

#### Explicit Headers

This implementation simply returns an explicit list of headers it was provided with.

```js
listener.use(
  ExcelExtractor({
    headerDetectionOptions: {
      algorithm: "explicitHeaders",
      headers: ["fiRsT NamE", "LaSt nAme", "emAil"],
    },
  })
);
```

#### Specific Rows

This implementation looks at specific rows and combines them into a single header. For example, if you knew that the header was in the third row, you could pass it `{ rowNumbers: [2] }`.

```js
listener.use(
  ExcelExtractor({
    headerDetectionOptions: {
      algorithm: "specificRows",
      rowNumbers: [2], // 0 based
    },
  })
);
```

#### Data Row & Sub Header Detection

This implementation attempts to detect the first data row and select the previous
row as the header. If the data row cannot be detected due to all the sample
rows being full and not castable to a number or boolean type, it also will attempt
to detect a sub header row by checking following rows after a header is detected
for significant fuzzy matching. If over half of the fields in a possible sub header
row fuzzy match with the originally detected header row, the sub header row becomes
the new header.

```js
listener.use(
  ExcelExtractor({
    headerDetectionOptions: {
      algorithm: "dataRowAndSubHeaderDetection",
      rowsToSearch: 30, // Default is 10
    },
  })
);
```

### Full Example

In this example, the `ExcelExtractor` is initialized with optional options, and then registered as middleware with the Flatfile listener. When an Excel file is uploaded, the plugin will extract the structured data and process it using the extractor's parser.

**listener.js**

```js listener.js
import { ExcelExtractor } from "@flatfile/plugin-xlsx-extractor";

export default async function (listener) {
  // Define optional options for the extractor
  const options = {
    raw: true,
    rawNumbers: true,
    cascadeRowValues: true,
    cascadeHeaderValues: true,
  };

  // Initialize the Excel extractor
  const excelExtractor = ExcelExtractor(options);

  // Register the extractor as a middleware for the Flatfile listener
  listener.use(excelExtractor);

  // When an Excel file is uploaded, the data will be extracted and processed using the extractor's parser.
}
```