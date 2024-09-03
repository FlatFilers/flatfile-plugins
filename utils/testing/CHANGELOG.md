# @flatfile/utils-testing

## 0.2.1

### Patch Changes

- 37babea: Update @flatfile/api dependency

## 0.2.0

### Minor Changes

- 3cbf59c: Fixed bug where `waitFor` promise was being fulfilled immediately. Changed `invocations` to store a log of FlatfileEvents and `invocationWatchers` to be compatible with the existing `matchEvent` method on Flatfile Listeners. Also exposed `invocationWatchers` to the public API.

## 0.1.6

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

## 0.1.5

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 0.1.4

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.

## 0.1.3

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 0.1.2

### Patch Changes

- 08f853a: Launches plugin-constraints

## 0.1.1

### Patch Changes

- 9aa56ac: Update axios dependency

## 0.1.0

### Minor Changes

- 30981b2: Dependency updates

## 0.0.7

### Patch Changes

- 7a0073d: Dependency cleanup

## 0.0.6

### Patch Changes

- 0d5f2c1: Introducing the @flatfile/plugin-convert-yaml-schema plugin to configure Flatfile Spaces based on a provided YAML Schema.
  DRY up and release YAML plugin, remove accidental edits to JSON plugin.

## 0.0.5

### Patch Changes

- 28820d5: Release to update @flatfile/api dep

## 0.0.4

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.0.3

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.0.2

### Patch Changes

- f5efd60: Update @flatfile/listener dependency
