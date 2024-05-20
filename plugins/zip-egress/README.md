# @flatfile/plugin-zip-egress

This plugin is designed to egress a Flatfile Workbook as a collection of .csv files within a .zip archive. 

## Usage

Install the plugin:

```bash
npm i @flatfile/plugin-zip-egress
```

Plugin setup in `listener.ts` file:

```typescript
import type { FlatfileListener } from '@flatfile/listener'
import { zipEgressPlugin } from '@flatfile/plugin-zip-egress'

export default function (listener: FlatfileListener) {
  listener.use(zipEgressPlugin('workbook:downloadWorkbook'))
}
```
