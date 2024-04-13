<!-- START_INFOCARD -->

The `@flatfile/plugin-zip-extractor` plugin decompresses ZIP files and uploads their contents to Flatfile for further processing by other extractors.

**Event Type:** 
`listener.on('file:created')`

**Supported file types:** 
`.zip`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)


## Parameters

#### `options.debug` - `default: false` - `boolean` - (optional)
The `debug` parameter lets you toggle on/off helpful debugging messages for
development purposes.



## API Calls

- `api.files.download`
- `api.files.get`
- `api.files.update`
- `api.jobs.ack`
- `api.jobs.complete`
- `api.jobs.create`
- `api.jobs.fail`
- `api.jobs.update`



## Usage

Listen for a ZIP file to be uploaded to Flatfile. The file will be downloaded, unzipped, and the contents uploaded back to Flatfile. Once complete, the file will be ready for import in the Files area. This plugin is designed to be used in conjuction with other extractors, such as the [Excel Extractor](../extractors/xlsx-extractor), to extract and process the contents of the files contained in the ZIP file. Files with names beginning with `.` will be ignored as these are typically system files (i.e. `.DS_store`).

```bash install
npm i @flatfile/plugin-zip-extractor
```

```js import
import { ZipExtractor } from "@flatfile/plugin-zip-extractor";
```

**listener.js**  

```js listener.js
listener.use(ZipExtractor());
```

### Full Example

In this example, the `ZipExtractor` is initialized, and then registered as middleware with the Flatfile listener. When a JSON file is uploaded, the plugin will extract the contents of the ZIP file and upload the files to FlatFile.

```javascript
import { ZipExtractor } from "@flatfile/plugin-zip-extractor";

// Initialize the ZIP extractor
const zipExtractor = ZipExtractor();

// Register the extractor as a middleware for the Flatfile listener
listener.use(zipExtractor);

// When a ZIP file is uploaded, the files will be extracted and uploaded.
```