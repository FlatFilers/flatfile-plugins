# @flatfile/plugin-convert-yaml-schema

## 0.5.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [fe21d6e]
  - @flatfile/plugin-space-configure@0.8.0
  - @flatfile/plugin-convert-json-schema@0.7.0

## 0.4.1

### Patch Changes

- Updated dependencies [9ccf2dd]
  - @flatfile/plugin-convert-json-schema@0.6.0

## 0.4.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/plugin-space-configure@0.7.0
  - @flatfile/plugin-convert-json-schema@0.5.0

## 0.3.2

### Patch Changes

- aa6c10b: This release fixes an async/await bug
- Updated dependencies [aa6c10b]
  - @flatfile/plugin-convert-json-schema@0.4.2

## 0.3.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-space-configure@0.6.1
  - @flatfile/plugin-convert-json-schema@0.4.1

## 0.3.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-space-configure@0.6.0
  - @flatfile/plugin-convert-json-schema@0.4.0

## 0.2.4

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-space-configure@0.5.3
  - @flatfile/plugin-convert-json-schema@0.3.4

## 0.2.3

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/plugin-space-configure@0.5.2
  - @flatfile/plugin-convert-json-schema@0.3.3

## 0.2.2

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-space-configure@0.5.1
  - @flatfile/plugin-convert-json-schema@0.3.2

## 0.2.1

### Patch Changes

- Updated dependencies [5f77620]
  - @flatfile/plugin-space-configure@0.5.0
  - @flatfile/plugin-convert-json-schema@0.3.1

## 0.2.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/plugin-space-configure@0.4.0
  - @flatfile/plugin-convert-json-schema@0.3.0

## 0.1.4

### Patch Changes

- fd5252b: update readme and package keywords
- Updated dependencies [fd5252b]
  - @flatfile/plugin-convert-json-schema@0.2.4

## 0.1.3

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/plugin-space-configure@0.3.5
  - @flatfile/plugin-convert-json-schema@0.2.3

## 0.1.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/plugin-space-configure@0.3.2
  - @flatfile/plugin-convert-json-schema@0.2.2
  - @flatfile/util-fetch-schema@0.1.2
  - @flatfile/utils-testing@0.1.3

## 0.1.1

### Patch Changes

- 9aa56ac: Update axios dependency
- Updated dependencies [9aa56ac]
- Updated dependencies [43a3a41]
  - @flatfile/plugin-convert-json-schema@0.2.1
  - @flatfile/util-fetch-schema@0.1.1
  - @flatfile/utils-testing@0.1.1
  - @flatfile/plugin-space-configure@0.3.0

## 0.1.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/plugin-space-configure@0.2.0
  - @flatfile/plugin-convert-json-schema@0.2.0
  - @flatfile/util-fetch-schema@0.1.0
  - @flatfile/utils-testing@0.1.0

## 0.0.4

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
  - @flatfile/plugin-space-configure@0.1.8
  - @flatfile/plugin-convert-json-schema@0.1.1
  - @flatfile/util-fetch-schema@0.0.3
  - @flatfile/utils-testing@0.0.7

## 0.0.3

### Patch Changes

- Updated dependencies [6d1ddf1]
  - @flatfile/plugin-convert-json-schema@0.1.0

## 0.0.2

### Patch Changes

- 0d5f2c1: Introducing the @flatfile/plugin-convert-yaml-schema plugin to configure Flatfile Spaces based on a provided YAML Schema.
  DRY up and release YAML plugin, remove accidental edits to JSON plugin.
- Updated dependencies [0d5f2c1]
  - @flatfile/util-fetch-schema@0.0.2
  - @flatfile/utils-testing@0.0.6

## 0.0.1

### Patch Changes
