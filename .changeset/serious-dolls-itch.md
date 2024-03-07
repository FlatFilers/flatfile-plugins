---
'@flatfile/plugin-foreign-db-extractor': patch
---

The `@flatfile/plugin-foreign-db-extractor` plugin listens for `.bak` files uploaded to Flatfile, then restores the `.bak` to a Flatfile hosted Microsoft SQL Server database making the data available in the "Uploaded Files" view as any other extracted file. This plugin is useful for customers who have very large datasets stored in a Microsoft SQL Server database and access that data in a Flatfile Workbook.
