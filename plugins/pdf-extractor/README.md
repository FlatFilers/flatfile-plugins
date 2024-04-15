<!-- START_INFOCARD -->

This plugin will parse a data table in a PDF file and extract it into Flatfile.

**Event Type:**
`listener.on('file:created')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

#### `opt.apiKey` - `string` - (required)
The `apiKey` parameter specifies you `pdftables.com` API key.

#### `opt.debug` - `boolean`
The `debug` parameter lets you toggle on/off helpful debugging messages for
development purposes.



## API Calls

- `api.files.upload`



## Usage

A subscription to `pdftables.com` is required for this plugin to work. Create an API key there and use it below.

```bash install
npm i @flatfile/plugin-pdf-extractor
```

```ts import
import { pdfExtractorPlugin } from "@flatfile/plugin-pdf-extractor";
```

#### JavaScript 

**listener.js**  

```js listener.js
export default function (listener) {
  listener.use(pdfExtractorPlugin({ apiKey: "key" }));
}
```

#### TypeScript

**listener.ts**  

```ts listener.ts
export default function (listener: FlatfileListener) {
  listener.use(pdfExtractorPlugin({ apiKey: "key" }));
}
```
