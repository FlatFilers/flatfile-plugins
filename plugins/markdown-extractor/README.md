<!-- START_INFOCARD -->

The `@flatfile/plugin-markdown-extractor` plugin parses Markdown files and extracts tabular data, creating sheets in Flatfile for each table found.

**Event Type:** 
`listener.on('file:created')`

**Supported file types:** 
`.md`

<!-- END_INFOCARD -->

> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)

## Parameters



#### `options.maxTables` - `default: Infinity` - `number` - (optional)
The `maxTables` parameter allows you to limit the number of tables extracted from a single Markdown file.

#### `options.errorHandling` - `default: "lenient"` - `"strict" | "lenient"` - (optional)
The `errorHandling` parameter determines how the plugin handles parsing errors. In 'strict' mode, it throws errors, while in 'lenient' mode, it logs warnings and skips problematic tables.

#### `options.debug` - `default: false` - `boolean` - (optional)
The `debug` parameter enables additional logging for troubleshooting.

## Usage

Listen for a Markdown file to be uploaded to Flatfile. The platform will then extract the file automatically. Once complete, the file will be ready for import in the Files area.

```bash Install
npm i @flatfile/plugin-markdown-extractor
```

```js import
import { MarkdownExtractor } from "@flatfile/plugin-markdown-extractor";
```

```js listener.js
listener.use(MarkdownExtractor());
```

### Full Example

In this example, the `MarkdownExtractor` is initialized with custom options, and then registered as middleware with the Flatfile listener. When a Markdown file is uploaded, the plugin will extract the tabular data and process it using the extractor's parser.

```javascript
import { MarkdownExtractor } from "@flatfile/plugin-markdown-extractor";

export default async function (listener) {
  // Define optional options for the extractor
  const options = {
    maxTables: 5,
    errorHandling: 'strict',
    debug: true
  };

  // Initialize the Markdown extractor
  const markdownExtractor = MarkdownExtractor(options);

  // Register the extractor as a middleware for the Flatfile listener
  listener.use(markdownExtractor);

  // When a Markdown file is uploaded, the tabular data will be extracted and processed using the extractor's parser.
}
```

This plugin will create a new sheet for each table found in the Markdown file, with the table headers becoming field names and the rows becoming records.
