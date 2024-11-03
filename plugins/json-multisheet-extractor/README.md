<!-- START_INFOCARD -->

The `@flatfile/json-multisheet-extractor` plugin parses a JSON file and extracts second-level nested objects as records into first level defined Sheets in Flatfile.

For example:
```json
{
	"contacts": [ // sheet 1
		{ // record 1
			"firstName": "John", // header 1, value
            "lastName": "Doe", // header 2, value
            "email": "john.doe@example.com"
		},
		{ // record 2
			"firstName": "Jane", // header 1, value
            "lastName": "Smith",
            "email": "jane.smith@example.com"
		},
	],
	"orders": [ // sheet 2
		{ // record 1
			"id": "ORD123456", // header 1, value
            "amount": 250 // header 2, value
		},
	]
}
```

**Event Type:** 
`listener.on('file:created')`

**Supported file types:** 
`.json`

<!-- END_INFOCARD -->

> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

### `options.chunkSize` - `default: "10_000"` - `number` - (optional)
The `chunkSize` parameter allows you to specify the quantity of records to in each chunk.
Note: Larger chunks consume more memory but may process faster


### `options.parallel` - `default: "1"` - `number` - (optional)
The `parallel` parameter allows you to specify the number of chunks to process in parallel.
Note: Higher values may improve performance but increase memory usage



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

Listen for a JSON file to be uploaded to Flatfile. The platform will then extract the file automatically. Once complete, the file will be ready for import in the Files area.

```bash Install
npm i @flatfile/plugin-json-multisheet-extractor
```

```js import
import { JSONMultiSheetExtractor } from "@flatfile/plugin-json-multisheet-extractor";
```

```js listener.js
listener.use(JSONMultiSheetExtractor());
```



### Full Example

In this example, the `JSONMultiSheetExtractor` is initialized, and then registered as middleware with the Flatfile listener. When a JSON file is uploaded, the plugin will extract the structured data and process it the extractor's parser.

```javascript
import { JSONMultiSheetExtractor } from "@flatfile/plugin-json-multisheet-extractor";

// Initialize the JSON multi-sheet extractor
const jsonMultiSheetExtractor = JSONMultiSheetExtractor();

// Register the extractor as a middleware for the Flatfile listener
listener.use(jsonMultiSheetExtractor);

// When a JSON file is uploaded, the data will be extracted and processed using the extractor's parser.
```

See a working example in our [flatfile-docs-kitchen-sink](https://github.com/FlatFilers/flatfile-docs-kitchen-sink/blob/main/typescript/extractors/index.ts) Github repo.

