# @flatfile/plugin-convert-openapi-schema

## 0.3.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-space-configure@0.6.1

## 0.3.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-space-configure@0.6.0

## 0.2.4

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-space-configure@0.5.3

## 0.2.3

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/plugin-space-configure@0.5.2

## 0.2.2

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-space-configure@0.5.1

## 0.2.1

### Patch Changes

- Updated dependencies [5f77620]
  - @flatfile/plugin-space-configure@0.5.0

## 0.2.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/plugin-space-configure@0.4.0

## 0.1.4

### Patch Changes

- fd5252b: update readme and package keywords

## 0.1.3

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/plugin-space-configure@0.3.5

## 0.1.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/plugin-space-configure@0.3.2

## 0.1.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser

## 0.1.0

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- @flatfile/plugin-space-configure@0.3.1

## 0.0.5

### Patch Changes

- 9aa56ac: Update axios dependency
- Updated dependencies [43a3a41]
  - @flatfile/plugin-space-configure@0.3.0

## 0.0.4

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/plugin-space-configure@0.2.0

## 0.0.3

### Patch Changes

- 5704be5: Introducing the @flatfile/plugin-convert-openapi-schema plugin!

  Switched @flatfile/plugin-dxp-configure build tool.

- Updated dependencies [7a0073d]
  - @flatfile/plugin-space-configure@0.1.8

## 0.0.2

### Patch Changes

- 7fa7925: updating readmes
