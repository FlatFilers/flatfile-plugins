<!-- START_INFOCARD -->

The `@flatfile/plugin-extract-markdown` plugin parses Markdown files and extracts tabular data, creating sheets in Flatfile for each table found.

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
npm i @flatfile/plugin-extract-markdown
```

```js import
import { extractMarkdown } from "@flatfile/plugin-extract-markdown";
```

```js listener.js
listener.use(extractMarkdown());
```

### Full Example

In this example, the `extractMarkdown` is initialized with custom options, and then registered as middleware with the Flatfile listener. When a Markdown file is uploaded, the plugin will extract the tabular data and process it using the extractor's parser.

```javascript
import { extractMarkdown } from "@flatfile/plugin-extract-markdown";

export default function (listener) {
  listener.use(extractMarkdown({
    maxTables: 5,
    errorHandling: 'strict',
    debug: true
  }));

  // ...the rest of your listener...
}
```

This plugin will create a new sheet for each table found in the Markdown file, with the table headers becoming field names and the rows becoming records.
