<!-- START_INFOCARD -->

The `@flatfile/plugin-delimiter-extractor` package is a plugin for parsing delimited files and extracting them into Flatfile. It utilizes various libraries to parse files and retrieve the structured data efficiently.

**Event Type:**
`listener.on('file:created')`

**Supported delimiters:**
`;`, `:`, `~`, `^`, `#`

**Note:** `\t`, `|`, and `,` are handled natively in the platform.

<!-- END_INFOCARD -->

> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)


## Parameters

#### `fileExt` - `string` - (required)
The `fileExt` parameter is used to specify the file name or extension to
listen for.


#### `options.delimiter` - `string` - (required)
The `delimiter` parameter is used to specify the delimiter used in the file.


#### `options.dynamicTyping` - `boolean` - `default: "false"`
If `true`, numeric and boolean data will be converted to their type instead of
remaining strings. Numeric data must conform to the definition of a decimal
literal. Numerical values greater than 2^53 or less than -2^53 will not be
converted to numbers to preserve precision. European-formatted numbers must
have commas and dots swapped.


#### `options.skipEmptyLines` - `boolean | 'greedy'`
If `true`, lines that are completely empty (those which evaluate to an empty
string) will be skipped. If set to `greedy`, lines that don't have any content
(those which have only whitespace after parsing) will also be skipped.


#### `options.transform` - `function`
A function to apply on each value. The function receives the value as an
argument The return value of the function will replace the value it received.
The transform function is applied before `dynamicTyping`.


#### `options.chunkSize` - `default: 10_000` - `number` - (optional)
The `chunkSize` parameter allows you to specify the quantity of records to in
each chunk.


#### `options.parallel` - `default: 1` - `number` - (optional)
The `parallel` parameter allows you to specify the number of chunks to process
in parallel.



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

Listen for an delimited file to be uploaded to Flatfile. The platform will then extract the file automatically. Once complete, the file will be ready for import in the Files area.

```bash install
npm i @flatfile/plugin-delimiter-extractor
```

```js import
import { DelimiterExtractor } from "@flatfile/plugin-delimiter-extractor";
```

```js listener.js
listener.use(DelimiterExtractor(".txt", { delimiter: ":" }));
```


### Full Example

In this example, the DelimiterExtractor is initialized for extracting TXT files with optional options, and then registered as middleware with the Flatfile listener. When a TXT file is uploaded, the plugin will extract the structured data and process it using the extractor's parser.

```javascript
import { DelimiterExtractor } from "@flatfile/plugin-delimiter-extractor";

// Define optional options for the extractor (e.g., { dynamicTyping: true })
const options = {
  delimiter: ":",
  dynamicTyping: true,
  skipEmptyLines: true,
  transform: (value) => value.toUpperCase(),
};

// Initialize the TXT extractor
const delimiterExtractor = DelimiterExtractor(".txt", options);

// Register the extractor as a middleware for the Flatfile listener
listener.use(delimiterExtractor);

// When a TXT file is uploaded, the data will be extracted and processed using the extractor's parser.
```