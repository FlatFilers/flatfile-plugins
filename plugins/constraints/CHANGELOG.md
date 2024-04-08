# @flatfile/plugin-constraints

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
