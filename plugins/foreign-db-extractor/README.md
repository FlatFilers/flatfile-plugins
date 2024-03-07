# @flatfile/plugin-foreign-db-extractor

This plugin listens for a `.bak` file to be uploaded to Flatfile, then restores it to a Flatfile hosted SQL Server database making the data available in the Uploaded Files view.

## Get Started

Access to this feature on the Flatfile Platform need to be enabled per account. Please reach out to our support team to discuss using the Foreign DB plugin!

```bash
npm i @flatfile/plugin-foreign-db-extractor @flatfile/listener
```

```typescript
import type { FlatfileListener } from '@flatfile/listener'
import { foreignDBExtractor } from '@flatfile/plugin-foreign-db-extractor';

export default function (listener: FlatfileListener) {
  listener.use(foreignDBExtractor());
}
```