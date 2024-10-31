# @flatfile/plugin-autocast

## 4.0.0

### Patch Changes

- Updated dependencies [c55a4e3]
  - @flatfile/plugin-record-hook@1.9.0

## 3.0.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/plugin-record-hook@1.8.0
  - @flatfile/util-common@1.5.0

## 2.0.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-record-hook@1.7.1
  - @flatfile/util-common@1.4.1

## 2.0.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-record-hook@1.7.0
  - @flatfile/util-common@1.4.0

## 1.0.1

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-record-hook@1.6.1
  - @flatfile/util-common@1.3.8

## 1.0.0

### Minor Changes

- 2829595: This release adds support for the new string-list and enum-list field types.

### Patch Changes

- Updated dependencies [2829595]
  - @flatfile/plugin-record-hook@1.6.0

## 0.8.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/plugin-record-hook@1.5.3
  - @flatfile/util-common@1.3.2

## 0.8.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-record-hook@1.5.2
  - @flatfile/util-common@1.3.1

## 0.8.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-common@1.3.0

## 0.7.11

### Patch Changes

- 6d45649: Readme markup changes for better styling
- Updated dependencies [6d45649]
  - @flatfile/plugin-record-hook@1.4.9

## 0.7.10

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/plugin-record-hook@1.4.7
  - @flatfile/util-common@1.1.1

## 0.7.9

### Patch Changes

- 0e25366: update autocast readme

## 0.7.8

### Patch Changes

- 4574c86: Adding keywords

## 0.7.7

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/plugin-record-hook@1.4.6
  - @flatfile/util-common@1.0.3

## 0.7.6

### Patch Changes

- 16f314f: This release fixes the builds of plugins utilizing the recordHook package by including recordHook as an external. This also moves the listener dep to peerDependencies which are considered externals.
- Updated dependencies [16f314f]
  - @flatfile/plugin-record-hook@1.4.5

## 0.7.5

### Patch Changes

- 40108fd: This release adds string casting to the autocast plugin.

## 0.7.4

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0
  - @flatfile/plugin-record-hook@1.4.4

## 0.7.3

### Patch Changes

- f53ecd8: This release makes the autocast error message friendlier for non-technical users.

## 0.7.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/plugin-record-hook@1.4.3
  - @flatfile/util-common@0.4.2

## 0.7.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser
- Updated dependencies [4a417af]
  - @flatfile/plugin-record-hook@1.4.1
  - @flatfile/util-common@0.4.1

## 0.7.0

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- Updated dependencies [7c1c094]
- Updated dependencies [7c1c094]
  - @flatfile/plugin-record-hook@1.4.0
  - @flatfile/util-common@0.4.0

## 0.6.0

### Minor Changes

- 94e245a: This release upgrades the messaging when a value is cast. It also fixes a bug when the autocast plugin is used concurrently with recordHooks.

## 0.5.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/plugin-record-hook@1.3.0
  - @flatfile/util-common@0.3.0

## 0.4.1

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
- Updated dependencies [97ffa1c]
  - @flatfile/plugin-record-hook@1.2.1
  - @flatfile/util-common@0.2.5

## 0.4.0

### Minor Changes

- 9d36229: Switch build tools to rollup. Builds from rollup for CDN builds to be included.

### Patch Changes

- Updated dependencies [9d36229]
  - @flatfile/plugin-record-hook@1.2.0

## 0.3.4

### Patch Changes

- 37873a4: Bug fix

## 0.3.3

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- Updated dependencies [28820d5]
  - @flatfile/plugin-record-hook@1.1.12
  - @flatfile/util-common@0.2.3

## 0.3.2

### Patch Changes

- cb25574: Update @flatfile/api dependency
- Updated dependencies [cb25574]
  - @flatfile/plugin-record-hook@1.1.6

## 0.3.1

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version
- Updated dependencies [f2b2f59]
  - @flatfile/plugin-record-hook@1.1.4

## 0.3.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/plugin-record-hook@1.1.0
  - @flatfile/util-common@0.2.0

## 0.2.2

### Patch Changes

- 3e28c51: Fix for date casting

## 0.2.1

### Patch Changes

- ccbbbc9: Fix sheet filtering options to require sheetSlug.

## 0.2.0

### Minor Changes

- 966cf91: This release introduces field filters, and enables filtering by either sheetId or sheetSlug.

## 0.1.0

### Minor Changes

- 15dc4fe: Introduction of the autocast plugin!

### Patch Changes

- Updated dependencies [15dc4fe]
  - @flatfile/plugin-record-hook@1.0.4

## 0.0.4

### Patch Changes

- 7fa7925: updating readmes
