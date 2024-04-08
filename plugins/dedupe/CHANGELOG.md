# @flatfile/plugin-dedupe

## 1.0.2

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/plugin-job-handler@0.4.2
  - @flatfile/util-common@1.1.1

## 1.0.1

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/plugin-job-handler@0.4.1
  - @flatfile/util-common@1.0.3

## 1.0.0

### Major Changes

- ed308f5: `@flatfile/plugin-dedupe`: This release improves dedupe's handling of records. Previously it only deduped the first 10k records. Now it dedupes the entire sheet. It takes advantage of the `processRecords` utility for retrieving and finding duplicates, and creates a bulk record deletion job. Additionally it improves error messaging and bundles for both NodeJS and the browser.

  `@flatfile/plugin-job-handler`: This release updates `jobHandler`'s job parameter to allow passing an `EventFilter`.

  `@flatfile/util-common`: This release fixes cross compatibility issues by using `@flatfile/cross-env-config` to retrieve environment variables.

### Patch Changes

- Updated dependencies [ed308f5]
  - @flatfile/plugin-job-handler@0.4.0
  - @flatfile/util-common@1.0.2

## 0.1.1

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 0.1.0

### Minor Changes

- 30981b2: Dependency updates

## 0.0.8

### Patch Changes

- 7a0073d: Dependency cleanup

## 0.0.7

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- 2dfe659: Bug fix when no duplicate values found

## 0.0.6

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.0.5

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.0.4

### Patch Changes

- 134cf31: Minor bug fixes

## 0.0.3

### Patch Changes

- f5efd60: Update @flatfile/listener dependency

## 0.0.2

### Patch Changes

- 087688f: fix: Proper job ack on failure
  fix: Use new instance of listener after filter operation
  fix: Add server errors to logging

## 0.0.1

### Patch Changes

- 69bbfcf: Initial release
