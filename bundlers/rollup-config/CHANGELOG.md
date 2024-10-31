# @flatfile/bundler-config-rollup

## 0.3.0

### Minor Changes

- c55a4e3: This release introduces the @flatfile/plugin-export-delimited-zip plugin. This plugin runs on a Workbook-level action to export the Workbook's Sheets as CSV files in a Zip file and uploaded back to Flatfile.

  Additionally, this PR updates some documentation.

## 0.2.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

## 0.1.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 0.1.0

### Minor Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
