# @flatfile/plugin-tsv-extractor

## 1.8.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support

## 1.8.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

## 1.7.3

### Patch Changes

- 37babea: Update @flatfile/api dependency

## 1.7.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

## 1.7.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 1.7.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 1.6.2

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.

## 1.6.1

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 1.6.0

### Minor Changes

- 30981b2: Dependency updates

## 1.5.4

### Patch Changes

- 7a0073d: Dependency cleanup

## 1.5.3

### Patch Changes

- 28820d5: Release to update @flatfile/api dep

## 1.5.2

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 1.5.1

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 1.5.0

### Minor Changes

- cbf391e: Deprecate PSV/TSV extractors since PSV/TSV files are now natively supported by the Flatfile Platform.

## 1.4.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/plugin-delimiter-extractor@0.6.0

## 1.3.0

### Minor Changes

- 447691a: Add configurable batch options

### Patch Changes

- Updated dependencies [447691a]
  - @flatfile/plugin-delimiter-extractor@0.5.0

## 1.2.4

### Patch Changes

- Updated dependencies [c0b8d8d]
  - @flatfile/plugin-delimiter-extractor@0.4.0

## 1.2.3

### Patch Changes

- 2e7fce8: Remove unsupported parameter

## 1.2.2

### Patch Changes

- Updated dependencies [1cd2f31]
  - @flatfile/plugin-delimiter-extractor@0.3.0

## 1.2.1

### Patch Changes

- Updated dependencies [77b9237]
  - @flatfile/plugin-delimiter-extractor@0.2.0

## 1.2.0

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor and use custom parsers. Add .tsv file extractor and a generic delimiter extractor. Add header row detection to the Excel extractor.

### Patch Changes

- Updated dependencies [2b15b32]
  - @flatfile/plugin-delimiter-extractor@0.1.0
