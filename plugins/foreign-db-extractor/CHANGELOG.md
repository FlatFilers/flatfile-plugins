# @flatfile/plugin-foreign-db-extractor

## 0.0.2

### Patch Changes

- 5da734d: This release improves the ForeignDB extractor's error handling and retrieval of DB user.

## 0.0.1

### Patch Changes

- 12e8a9c: The `@flatfile/plugin-foreign-db-extractor` plugin listens for `.bak` files uploaded to Flatfile, then restores the `.bak` to a Flatfile hosted Microsoft SQL Server database making the data available in the "Uploaded Files" view as a readonly File Workbook with each database table viewable as a Flatfile Sheet. The data is accessible the same as any other extracted file (i.e. `.csv` or `.xlsx`), however the source is coming from the restored database. This plugin is useful for customers who have very large datasets stored in a Microsoft SQL Server database and access that data in a Flatfile Workbook.
