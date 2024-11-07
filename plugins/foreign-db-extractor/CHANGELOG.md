# @flatfile/plugin-foreign-db-extractor

## 0.4.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

## 0.3.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

## 0.2.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support

## 0.2.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

## 0.1.3

### Patch Changes

- 37babea: Update @flatfile/api dependency

## 0.1.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

## 0.1.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 0.1.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 0.0.5

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.

## 0.0.4

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

## 0.0.3

### Patch Changes

- 96cf254: This release fixes a build issue and switches node-fetch out for cross-fetch

## 0.0.2

### Patch Changes

- 5da734d: This release improves the ForeignDB extractor's error handling and retrieval of DB user.

## 0.0.1

### Patch Changes

- 12e8a9c: The `@flatfile/plugin-foreign-db-extractor` plugin listens for `.bak` files uploaded to Flatfile, then restores the `.bak` to a Flatfile hosted Microsoft SQL Server database making the data available in the "Uploaded Files" view as a readonly File Workbook with each database table viewable as a Flatfile Sheet. The data is accessible the same as any other extracted file (i.e. `.csv` or `.xlsx`), however the source is coming from the restored database. This plugin is useful for customers who have very large datasets stored in a Microsoft SQL Server database and access that data in a Flatfile Workbook.
