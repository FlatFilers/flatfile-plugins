<!-- START_INFOCARD -->

The `@flatfile/plugin-export-workbook` plugin exports data in a Flatfile Workbook.

**Event Type:**
`listener.on('job:ready')` 

**Supported file types:**
`.xlsx`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](https://flatfile.com/docs/orchestration/listeners#listener-types)


## Parameters

### `debug` *boolean*

The `debug` parameter lets you toggle on/off helpful debugging messages for development purposes.


## Usage

An action with the operation name of "downloadWorkbook" must be configured on a Workbook (not a Sheet) in order to the plugin to be triggered.

### Install

```bash install
npm i @flatfile/plugin-export-workbook
```

### Import

```ts import
import { exportWorkbookPlugin } from "@flatfile/plugin-export-workbook";
```

### `workbook.config.json`

```ts workbook.config.json
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

### `listener.js`

```ts listener.js
listener.use(exportWorkbookPlugin());
```

