# @flatfile/plugin-zip-extractor

## 0.6.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-job-handler@0.6.1
  - @flatfile/util-file-buffer@0.4.1
  - @flatfile/util-common@1.4.1

## 0.6.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-job-handler@0.6.0
  - @flatfile/util-file-buffer@0.4.0
  - @flatfile/util-common@1.4.0

## 0.5.4

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-job-handler@0.5.5
  - @flatfile/util-file-buffer@0.3.3
  - @flatfile/util-common@1.3.8

## 0.5.3

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/plugin-job-handler@0.5.2
  - @flatfile/util-file-buffer@0.3.2
  - @flatfile/util-common@1.3.2

## 0.5.2

### Patch Changes

- 4e016fd: This release fixes an async issue that caused the zip extractor to fail when deployed.

## 0.5.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/util-file-buffer@0.3.1
  - @flatfile/util-common@1.3.1

## 0.5.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-file-buffer@0.3.0
  - @flatfile/util-common@1.3.0

## 0.4.5

### Patch Changes

- a4666a6: Add readme content and package keywords

## 0.4.4

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-file-buffer@0.2.2
  - @flatfile/util-common@1.1.1

## 0.4.3

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0

## 0.4.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-file-buffer@0.2.1
  - @flatfile/util-common@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies [7c1c094]
  - @flatfile/util-common@0.4.0

## 0.4.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-file-buffer@0.2.0
  - @flatfile/util-common@0.3.0

## 0.3.10

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
- Updated dependencies [97ffa1c]
  - @flatfile/util-file-buffer@0.1.4
  - @flatfile/util-common@0.2.5

## 0.3.9

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- Updated dependencies [28820d5]
  - @flatfile/util-file-buffer@0.1.3
  - @flatfile/util-common@0.2.3

## 0.3.8

### Patch Changes

- cb25574: Update @flatfile/api dependency
- Updated dependencies [cb25574]
  - @flatfile/util-file-buffer@0.1.2

## 0.3.7

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version
- Updated dependencies [f2b2f59]
  - @flatfile/util-file-buffer@0.1.1

## 0.3.6

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/util-file-buffer@0.1.0
  - @flatfile/util-common@0.2.0

## 0.3.5

### Patch Changes

- 9786771: Use system's tmp directory for unzipping

## 0.3.4

### Patch Changes

- f5efd60: Update @flatfile/listener dependency
- Updated dependencies [f5efd60]
  - @flatfile/util-file-buffer@0.0.4

## 0.3.3

### Patch Changes

- Updated dependencies [490e8f1]
  - @flatfile/util-file-buffer@0.0.3

## 0.3.2

### Patch Changes

- 010a31c: Exclude \_\_MACOSX

## 0.3.1

### Patch Changes

- 4651120: Add @deprecated comment

## 0.3.0

### Minor Changes

- 77b9237: Add backwards compatibility for renamed extractors

## 0.2.0

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor and use custom parsers. Add .tsv file extractor and a generic delimiter extractor. Add header row detection to the Excel extractor.

## 0.1.0

### Minor Changes

- 3ce6307: Release of Zip file extractor
