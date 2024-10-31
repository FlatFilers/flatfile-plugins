<!-- START_INFOCARD -->

The `@flatfile/plugin-export-delimited-zip` plugin exports data from Flatfile sheets to delimited files (e.g., CSV) and compresses them into a ZIP file. This plugin provides an efficient way to download and package your data from Flatfile workbooks.

**Event Type:** 
`job:ready`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

#### `job` - `string` 
The job name to trigger the export. Default: 'downloadDelimited'

#### `delimiter` - `string`
The delimiter to use in the exported files. Default: ','

#### `fileExtension` - `string`
The file extension for the exported files. Default: 'csv'

#### `debug` - `boolean` - (optional)
Enable debug logging. Default: false



## API Calls

- `api.jobs.ack`
- `api.jobs.complete`
- `api.jobs.fail`
- `api.sheets.list`
- `api.records.get`
- `api.files.upload`



## Usage

**install**
```bash
npm install @flatfile/plugin-export-delimited-zip
```

**listener.ts**
```typescript
import type { FlatfileListener } from '@flatfile/listener'
import { exportDelimitedZip } from '@flatfile/plugin-export-delimited-zip'

export default function (listener: FlatfileListener) {
  listener.use(exportDelimitedZip({
      job: 'export-delimited-zip',
      delimiter: ',',
      fileExtension: 'csv',
    }))
}
```
