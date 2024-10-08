# @flatfile/plugin-automap

## 0.5.2

### Patch Changes

- 4d4ef33: This release reverts from .some() back to .every().

## 0.5.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support

## 0.5.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

## 0.4.1

### Patch Changes

- 37babea: Update @flatfile/api dependency

## 0.4.0

### Minor Changes

- c166265: Updated listener to job:updated from job:created to account for the mapping plan now being run asynchronously. Updated the verfiyConfidentMatching from every to some to enable more concice autoMapping

## 0.3.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

## 0.3.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 0.3.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 0.2.5

### Patch Changes

- 6207eb5: Cleanup and update readme

## 0.2.4

### Patch Changes

- d676204: Add readme and update package keywords for automap plugin

## 0.2.3

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/common-plugin-utils@1.0.2

## 0.2.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 0.2.1

### Patch Changes

- 9fa31e2: Update defaultTargetSheet return value

## 0.2.0

### Minor Changes

- 30981b2: Dependency updates

## 0.1.3

### Patch Changes

- 7a0073d: Dependency cleanup

## 0.1.2

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- 8c29fa1: Glob match on extract operation to provide automap support on all extractors

## 0.1.1

### Patch Changes

- 8bfd065: Ignore `workbook:map` jobs that weren't created by the automap plugin

## 0.1.0

### Minor Changes

- 972c7a2: Match on sheet slug (in addition to sheet name & id)

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.0.4

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.0.3

### Patch Changes

- f5efd60: Update @flatfile/listener dependency

## 0.0.2

### Patch Changes

- 1d57795: Workaround VM logging constraints

## 0.0.1

### Patch Changes

- c3f1030: Initial
- Updated dependencies [c3f1030]
  - @flatfile/common-plugin-utils@1.0.1
