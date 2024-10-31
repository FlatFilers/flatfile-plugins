# @flatfile/plugin-dedupe

## 1.4.0

### Minor Changes

- c55a4e3: This release introduces the @flatfile/plugin-export-delimited-zip plugin. This plugin runs on a Workbook-level action to export the Workbook's Sheets as CSV files in a Zip file and uploaded back to Flatfile.

  Additionally, this PR updates some documentation.

## 1.3.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/plugin-job-handler@0.7.0
  - @flatfile/util-common@1.5.0

## 1.2.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-job-handler@0.6.1
  - @flatfile/util-common@1.4.1

## 1.2.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-job-handler@0.6.0
  - @flatfile/util-common@1.4.0

## 1.1.5

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-job-handler@0.5.5
  - @flatfile/util-common@1.3.8

## 1.1.4

### Patch Changes

- 2f1d9bb: This release provides a more instructive error message when the dedupe plugin is miscalled from a workbook-level action instead of a sheet-level action.

## 1.1.3

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/plugin-job-handler@0.5.2
  - @flatfile/util-common@1.3.2

## 1.1.2

### Patch Changes

- 3cb2665: This release updates the plugin's documentation with an example that doesn't require another library.

## 1.1.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-job-handler@0.5.1
  - @flatfile/util-common@1.3.1

## 1.1.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/plugin-job-handler@0.5.0
  - @flatfile/util-common@1.3.0

## 1.0.4

### Patch Changes

- 6d45649: Readme markup changes for better styling

## 1.0.3

### Patch Changes

- e4b8f1c: update readme and keywords

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
