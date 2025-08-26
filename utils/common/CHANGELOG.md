# @flatfile/util-common

## 1.7.2

### Patch Changes

- f6490f9: Fix extractor key normalization

## 1.7.1

### Patch Changes

- 814f962: Added normalize-sheet-config util

## 1.7.0

### Minor Changes

- ee80aa8: Add UMD build to @flatfile/utils-common

## 1.6.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

## 1.5.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

## 1.4.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support

## 1.4.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

## 1.3.8

### Patch Changes

- 37babea: Update @flatfile/api dependency

## 1.3.7

### Patch Changes

- Resolves an issue with simplified record format

## 1.3.6

### Patch Changes

- c23f5aa: Adds a more optimized method for streaming records without fetching the total pages first

## 1.3.4

### Patch Changes

- Resolved a type issue with simplified create

## 1.3.3

### Patch Changes

- 0a4afa0: Introduces Simplified record helpers for memory efficient processing of large datasets and launches a rollout plugin for helping with schema updating.

## 1.3.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

## 1.3.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 1.3.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 1.2.0

### Minor Changes

- b2984b1: This release sets the extracted sheet's slug.

## 1.1.1

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.

## 1.1.0

### Minor Changes

- 7796706: This release adds more common utilities and fixes a bug in processRecords when updating record values.

## 1.0.3

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

## 1.0.2

### Patch Changes

- ed308f5: `@flatfile/plugin-dedupe`: This release improves dedupe's handling of records. Previously it only deduped the first 10k records. Now it dedupes the entire sheet. It takes advantage of the `processRecords` utility for retrieving and finding duplicates, and creates a bulk record deletion job. Additionally it improves error messaging and bundles for both NodeJS and the browser.

  `@flatfile/plugin-job-handler`: This release updates `jobHandler`'s job parameter to allow passing an `EventFilter`.

  `@flatfile/util-common`: This release fixes cross compatibility issues by using `@flatfile/cross-env-config` to retrieve environment variables.

## 1.0.1

### Patch Changes

- 3fbca85: This release changes how the records are fetched to decrease fetch time for large responses.

## 1.0.0

### Major Changes

- feb2ced: @flatfile/util-common: This release provides additional record request options such as "filter" and passes the current pageNumber to the cb function. Additionally the cb will be called when no records are found for any wrap-up the cb needs to make.

  @flatfile/util-response-rejection: Since @flatfile/util-common now calls the cb when no records are found, this release updates @flatfile/util-response-rejection to check for records before processing.

  ```

  ```

## 0.4.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 0.4.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser

## 0.4.0

### Minor Changes

- 7c1c094: Update package.json exports

## 0.3.1

### Patch Changes

- 0d63b1f: This release add browser builds to the `@flatfile/util-response-rejection`, `@flatfile/plugin-webhook-egress`, `@flatfile/plugin-job-handler` & `@flatfile/util-common` plugins can be used in client-side apps.

## 0.3.0

### Minor Changes

- 30981b2: Dependency updates

## 0.2.5

### Patch Changes

- 7a0073d: Dependency cleanup
- 97ffa1c: Export workbook plugin bug fix for handling multiple comments on a cell

## 0.2.4

### Patch Changes

- 8a7a0b9: Small upgrade to processRecords() to let the callback return void

## 0.2.3

### Patch Changes

- 28820d5: Release to update @flatfile/api dep

## 0.2.2

### Patch Changes

- 82da1b9: Added a utility to process all records

## 0.2.1

### Patch Changes

- 134cf31: Minor bug fixes

## 0.2.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

## 0.1.1

### Patch Changes

- 15dc4fe: Introduction of the autocast plugin!

## 0.1.0

### Minor Changes

- 69fd41c: Introducing the new JobHandler plugin and the new SpaceConfigure plugin, as well as a new utilities for log message formatting.

## 0.0.2

### Patch Changes

- c859a10: Extract asyncBatch to a utility package
