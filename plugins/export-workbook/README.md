<!-- START_INFOCARD -->

The `@flatfile/plugin-export-workbook` plugin exports data in a Flatfile Workbook to a downloadable `.xlsx` file.

**Event Type:**
`listener.on('job:ready')` 

**Supported file types:**
`.xlsx`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](https://flatfile.com/docs/orchestration/listeners#listener-types)


## Parameters

#### `jobName` - `string` - (optional) 

The name of job that the plugin will fire on. If not provided, `workbook:downloadWorkbook` will be used.

#### `excludedSheets` - `string[]` - (optional) 

An array of sheets to be excluded from the export

#### `excludeFields` - `string[]` - (optional) 

An array of fields to be excluded from the export

#### `recordFilter` - `Flatfile.Filter` - (optional) 

Allows filtering exported records to `valid` or `error`. By default all records will be exported

#### `includeRecordIds` - `boolean` - (optional) 

Includes the record's ID

#### `autoDownload` - `boolean` - (optional) 

Automatically download the file after exporting

#### `debug` - `boolean` - (optional)

The `debug` parameter lets you toggle on/off helpful debugging messages for development purposes.



## Usage

An action with the operation name of "downloadWorkbook" must be configured on a Workbook (not a Sheet) in order for the plugin to be triggered.

#### `workbook.config.json`

```json workbook.config.json
  // ... inside Workbook configuration
  "actions": [
    {
      "operation": "downloadWorkbook",
      "mode": "foreground",
      "label": "Download Excel Workbook",
      "description": "Downloads Excel Workbook of Data",
      "primary": true
    }
  ]
  // ...
```

#### Install

```bash install
npm i @flatfile/plugin-export-workbook
```

#### `listener.js`

```ts listener.js
import type { FlatfileListener } from "@flatfile/listener";

import { exportWorkbookPlugin } from "@flatfile/plugin-export-workbook";

export default function (listener: FlatfileListener) {
  listener.use(exportWorkbookPlugin());
}
```

