# Flatfile File Buffer Plugin

This plugin will provide a file buffer for any configured file. It will read the file and return it as a [nodejs Buffer object[(https://nodejs.org/api/buffer.html). This is a helpful underlying utility for writing file extractor plugins.

`listener.js`

```js
import { fileBuffer } from '@flatfile/plugin-file-buffer'

export default (listener) => {
  listener.use(
    fileBuffer('.xml', (fileResource, buffer, event) => {
      // do something with the buffer
    })
  )
}
```

## Configuration

### `matchFile: string | RegExp`

- `string`: The file extension to match. Will see if the filename ends with this value.
- `RegExp`: A regular expression to match the filename against.

#### Example with Regexp

```js
import { fileBuffer } from '@flatfile/plugin-file-buffer'

export default (listener) => {
  listener.use(
    fileBuffer(/^import-(.+)\.xml$/, (fileResource, buffer, event) => {
      // do something with a file named like `import-<something>.xml`
    })
  )
}
```
