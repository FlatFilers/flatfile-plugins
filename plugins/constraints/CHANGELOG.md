# @flatfile/plugin-constraints

## 7.0.0

### Patch Changes

- Updated dependencies [776b6f4]
  - @flatfile/plugin-record-hook@1.11.0

## 6.0.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [fe21d6e]
  - @flatfile/plugin-record-hook@1.10.0

## 5.0.0

### Patch Changes

- Updated dependencies [c55a4e3]
  - @flatfile/plugin-record-hook@1.9.0

## 4.0.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/plugin-record-hook@1.8.0

## 3.0.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-record-hook@1.7.1

## 3.0.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-record-hook@1.7.0

## 2.0.1

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-record-hook@1.6.1

## 2.0.0

### Minor Changes

- 2829595: This release adds support for the new string-list and enum-list field types.

### Patch Changes

- Updated dependencies [2829595]
  - @flatfile/plugin-record-hook@1.6.0

## 1.2.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/plugin-record-hook@1.5.3

## 1.2.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-record-hook@1.5.2

## 1.2.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 1.1.8

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/plugin-record-hook@1.4.7

## 1.1.7

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/plugin-record-hook@1.4.6

## 1.1.6

### Patch Changes

- 16f314f: This release fixes the builds of plugins utilizing the recordHook package by including recordHook as an external. This also moves the listener dep to peerDependencies which are considered externals.
- Updated dependencies [16f314f]
  - @flatfile/plugin-record-hook@1.4.5

## 1.1.5

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/plugin-record-hook@1.4.3

## 1.1.4

### Patch Changes

- 34ac0dd: Make sure to export the externalSheetConstraint()

## 1.1.3

### Patch Changes

- 03176dd: Adds externalSheetConstraint()

## 1.1.2

### Patch Changes

- ad2977a: Fix constraints plugin's build.

## 1.1.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser
- Updated dependencies [4a417af]
  - @flatfile/plugin-record-hook@1.4.1

## 1.1.0

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- Updated dependencies [7c1c094]
- Updated dependencies [7c1c094]
  - @flatfile/plugin-record-hook@1.4.0

## 1.0.1

### Patch Changes

- 08f853a: Launches plugin-constraints
