# @flatfile/util-common

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
