# @flatfile/plugin-record-hook

## 1.4.9

### Patch Changes

- 6d45649: Readme markup changes for better styling

## 1.4.8

### Patch Changes

- 0dcdfb1: Update package keywords and readme content

## 1.4.7

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-common@1.1.1

## 1.4.6

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/util-common@1.0.3

## 1.4.5

### Patch Changes

- 16f314f: This release fixes the builds of plugins utilizing the recordHook package by including recordHook as an external. This also moves the listener dep to peerDependencies which are considered externals.

## 1.4.4

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0

## 1.4.3

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-common@0.4.2

## 1.4.2

### Patch Changes

- 26cef08: This release fixes a bug that prevented messages from being cleared when the recordHook did not make a modification to the record.

## 1.4.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser
- Updated dependencies [4a417af]
  - @flatfile/util-common@0.4.1

## 1.4.0

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- 7c1c094: Update UMD build
- Updated dependencies [7c1c094]
  - @flatfile/util-common@0.4.0

## 1.3.2

### Patch Changes

- 675f0ca: Optimizes data fetch

## 1.3.1

### Patch Changes

- 6cdb7ac: expand recordHook rollup config
- 9aa56ac: Update axios dependency
- 999b84b: Code clean up & fix check for modified records

## 1.3.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-common@0.3.0

## 1.2.2

### Patch Changes

- cf61e1c: Replace the effect library in favor of custom concurrency control in recordHook

## 1.2.1

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
- Updated dependencies [97ffa1c]
  - @flatfile/util-common@0.2.5

## 1.2.0

### Minor Changes

- 9d36229: Switch build tools to rollup. Builds from rollup for CDN builds to be included.

## 1.1.14

### Patch Changes

- 920df43: This update handles caching of record messages.

## 1.1.13

### Patch Changes

- f18a889: Human-readable errors from recordHook

## 1.1.12

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- Updated dependencies [28820d5]
  - @flatfile/util-common@0.2.3

## 1.1.11

### Patch Changes

- 4d3fd49: Bug fix for record comparison

## 1.1.10

### Patch Changes

- 2e2a201: Bug fix completing commits

## 1.1.9

### Patch Changes

- 265412b: Only complete commits when trackChanges is enabled on the Workbook
- e6ed034: Fix to compare full Record objects instead of just Record values

## 1.1.8

### Patch Changes

- 379e1d7: Dependency update

## 1.1.7

### Patch Changes

- d9333ff: Only updated modified records, set the record message source, & small bug fix

## 1.1.6

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 1.1.5

### Patch Changes

- f5cfe69: Change import method

## 1.1.4

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 1.1.3

### Patch Changes

- 134cf31: Minor bug fixes
- Updated dependencies [134cf31]
  - @flatfile/util-common@0.2.1

## 1.1.2

### Patch Changes

- b057912: Bug fix for bulkRecordhook caching

## 1.1.1

### Patch Changes

- 59a8b18: Bug fix to handle asynchronous handlers

## 1.1.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/util-common@0.2.0

## 1.0.4

### Patch Changes

- 15dc4fe: Introduction of the autocast plugin!
- Updated dependencies [15dc4fe]
  - @flatfile/util-common@0.1.1

## 1.0.3

### Patch Changes

- Updated dependencies [69fd41c]
  - @flatfile/util-common@0.1.0

## 1.0.2

### Patch Changes

- f5efd60: Update @flatfile/listener dependency

## 1.0.1

### Patch Changes

- c859a10: Extract asyncBatch to a utility package
- Updated dependencies [c859a10]
  - @flatfile/util-common@0.0.2

## 1.0.0

### Major Changes

- fe6e642: Create bulkRecordHook plugin

## 0.2.0

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor and use custom parsers. Add .tsv file extractor and a generic delimiter extractor. Add header row detection to the Excel extractor.

## 0.1.11

### Patch Changes

- 8a87451: Updates record-hook dependencies

## 0.1.10

### Patch Changes

- 7fa7925: updating readmes

## 0.1.9

### Patch Changes

- 8e41b36: Add FlatfileRecord as export

## 0.1.8

### Patch Changes

- 83c4c98: Update internals to use the dataUrl for updating records

## 0.1.7

### Patch Changes

- 41261d0: Build tooling refactor

## 0.1.6

### Patch Changes

- d589b7c: Update @flatfile/api to latest 1.5.6

## 0.1.5

### Patch Changes

- c2310c0: Add event to RecordHook Handler

## 0.1.4

### Patch Changes

- ab27fa9: Export both recordHook and RecordHook

## 0.1.3

### Patch Changes

- b925834: Fix messages being set on record properly

## 0.1.2

### Patch Changes

- e8a114f: Update version of listener

## 0.1.1

### Patch Changes

- 42bbefd: Add lifecycle methods and update packages

## 0.1.0

### Minor Changes

- a377336: Move RecordHook functionality into this package and remove configure dependency.

### Patch Changes

- 41e7f5a: upped the listener version

## 0.0.7

### Patch Changes

- cf6d07e: Fixes a bug where we don't return the promise so we can't wait for the event to complete

## 0.0.6

### Patch Changes

- 01b3e64: Introducing the DXP Configuration Plugin

## 0.0.5

### Patch Changes

- 8ed9bb3: Add four new plugin skeletons; add category metadata to existing

## 0.0.4

### Patch Changes

- ae45695: Update readmes and package info

## 0.0.3

### Patch Changes

- aaf6cc6: README updates

## 0.0.2

### Patch Changes

- 4ca7bb1: New transform plugin and improved documentation

## 0.0.1

### Patch Changes

- fbfaab9: Basic record hook plugin.
