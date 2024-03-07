# @flatfile/plugin-foreign-db-extractor

The `@flatfile/plugin-foreign-db-extractor` plugin listens for `.bak` files uploaded to Flatfile, then restores the `.bak` to a Flatfile hosted Microsoft SQL Server database making the data available in the "Uploaded Files" view as a readonly File Workbook with each database table viewable as a Flatfile Sheet. The data is accessible the same as any other extracted file (i.e. `.csv` or `.xlsx`), however the source is coming from the restored database. This plugin is useful for customers who have very large datasets stored in a Microsoft SQL Server database and access that data in a Flatfile Workbook.

![Screenshot 2024-03-07 at 12 53 20](https://github.com/FlatFilers/flatfile-plugins/assets/4754531/f65241f0-1eab-42d7-9252-14001f9a778e)

![Screenshot 2024-03-07 at 10 40 34](https://github.com/FlatFilers/flatfile-plugins/assets/4754531/093e65ba-eea7-4506-87af-45384634c735)

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
