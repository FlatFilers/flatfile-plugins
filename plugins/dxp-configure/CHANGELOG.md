# @flatfile/plugin-dxp-config

## 1.2.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support

## 1.2.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

## 1.1.3

### Patch Changes

- 37babea: Update @flatfile/api dependency

## 1.1.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

## 1.1.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 1.1.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 1.0.4

### Patch Changes

- 6207eb5: Cleanup and update readme

## 1.0.3

### Patch Changes

- f3fcc96: Update dependency to a non-vunerable version

## 1.0.2

### Patch Changes

- 67b1555: Add keywords and readme to dxp-config plugin

## 1.0.1

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.

## 1.0.0

### Major Changes

- 5de5811: Update space with the included workbook as the Primary Workbook Id

## 0.2.3

### Patch Changes

- 39a2b13: Account for undefined settings

## 0.2.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 0.2.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser

## 0.2.0

#### 2024-02-07

### Minor Changes

- 7c1c094: Update package.json exports

## 0.1.0

#### 2024-01-09

### Minor Changes

- 30981b2: Dependency updates

## 0.0.12

#### 2024-01-08

### Patch Changes

- 8f28095: Update @flatfile/configure

## 0.0.11

#### 2023-12-18

### Patch Changes

- 7a0073d: Dependency cleanup
- 5704be5: Introducing the @flatfile/plugin-convert-openapi-schema plugin!

  Switched @flatfile/plugin-dxp-configure build tool.

## 0.0.10

#### 2023-11-09

### Patch Changes

- 28820d5: Release to update @flatfile/api dep

## 0.0.9

#### 2023-10-10

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.0.8

#### 2023-09-27

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.0.7

#### 2023-09-21

### Patch Changes

- 134cf31: Minor bug fixes

## 0.0.6

#### 2023-08-25

### Patch Changes

- f5efd60: Update @flatfile/listener dependency

## 0.0.5

#### 2023-06-15

### Patch Changes

- 7fa7925: updating readmes

## 0.0.4

#### 2023-06-08

### Patch Changes

- 41261d0: Build tooling refactor

## 0.0.3

#### 2023-05-11

### Patch Changes

- bde3567: update the version of configure

## 0.0.2

#### 2023-05-05

### Patch Changes

- 01b3e64: Introducing the DXP Configuration Plugin

## 0.0.1

#### 2023-05-05

### Patch Changes

- Initial release
