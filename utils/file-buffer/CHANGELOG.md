# @flatfile/util-file-buffer

## 0.3.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 0.3.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 0.2.3

### Patch Changes

- 59099ae: Add package keywords and readme content to utils

## 0.2.2

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.

## 0.2.1

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 0.2.0

### Minor Changes

- 30981b2: Dependency updates

## 0.1.4

### Patch Changes

- 7a0073d: Dependency cleanup

## 0.1.3

### Patch Changes

- 28820d5: Release to update @flatfile/api dep

## 0.1.2

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.1.1

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.1.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

## 0.0.4

### Patch Changes

- f5efd60: Update @flatfile/listener dependency

## 0.0.3

### Patch Changes

- 490e8f1: Only run fileBuffer on uploaded files
