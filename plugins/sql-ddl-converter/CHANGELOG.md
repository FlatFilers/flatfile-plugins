# @flatfile/plugin-convert-sql-ddl

## 0.1.2

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-space-configure@0.5.1
  - @flatfile/plugin-convert-json-schema@0.3.2

## 0.1.1

### Patch Changes

- Updated dependencies [5f77620]
  - @flatfile/plugin-space-configure@0.5.0
  - @flatfile/plugin-convert-json-schema@0.3.1

## 0.1.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/plugin-space-configure@0.4.0
  - @flatfile/plugin-convert-json-schema@0.3.0

## 0.0.7

### Patch Changes

- fd5252b: update readme and package keywords
- Updated dependencies [fd5252b]
  - @flatfile/plugin-convert-json-schema@0.2.4

## 0.0.6

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/plugin-space-configure@0.3.5
  - @flatfile/plugin-convert-json-schema@0.2.3

## 0.0.5

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/plugin-space-configure@0.3.2
  - @flatfile/plugin-convert-json-schema@0.2.2

## 0.0.4

### Patch Changes

- 9aa56ac: Update axios dependency
- Updated dependencies [9aa56ac]
- Updated dependencies [43a3a41]
  - @flatfile/plugin-convert-json-schema@0.2.1
  - @flatfile/plugin-space-configure@0.3.0

## 0.0.3

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/plugin-space-configure@0.2.0
  - @flatfile/plugin-convert-json-schema@0.2.0

## 0.0.2

### Patch Changes

- 7fa7925: updating readmes
