# @flatfile/plugin-space-configure

## 0.6.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-job-handler@0.6.1

## 0.6.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-job-handler@0.6.0

## 0.5.3

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-job-handler@0.5.5

## 0.5.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/plugin-job-handler@0.5.2

## 0.5.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-job-handler@0.5.1

## 0.5.0

### Minor Changes

- 5f77620: Adds Support for Configuring Workbook Order for Spaces UI Sidebar

## 0.4.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/plugin-job-handler@0.5.0

## 0.3.6

### Patch Changes

- 9c905ce: Add readme and keywords for core plugins
- Updated dependencies [9c905ce]
  - @flatfile/plugin-job-handler@0.4.3

## 0.3.5

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/plugin-job-handler@0.4.2

## 0.3.4

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/plugin-job-handler@0.4.1

## 0.3.3

### Patch Changes

- Updated dependencies [ed308f5]
  - @flatfile/plugin-job-handler@0.4.0

## 0.3.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/plugin-job-handler@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [7c1c094]
  - @flatfile/plugin-job-handler@0.3.0

## 0.3.0

### Minor Changes

- 43a3a41: Accept documents in Setup object

## 0.2.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/plugin-job-handler@0.2.0

## 0.1.8

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
  - @flatfile/plugin-job-handler@0.1.7

## 0.1.7

### Patch Changes

- 91662e0: Dependency update

## 0.1.6

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- edaedf5: Fix tick params
- Updated dependencies [28820d5]
- Updated dependencies [edaedf5]
  - @flatfile/plugin-job-handler@0.1.5

## 0.1.5

### Patch Changes

- cb25574: Update @flatfile/api dependency
- Updated dependencies [cb25574]
  - @flatfile/plugin-job-handler@0.1.4

## 0.1.4

### Patch Changes

- d944bfb: Allow configuring spaces with no workbooks

## 0.1.3

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version
- Updated dependencies [f2b2f59]
  - @flatfile/plugin-job-handler@0.1.3

## 0.1.2

### Patch Changes

- 134cf31: Minor bug fixes

## 0.1.1

### Patch Changes

- 6259301: Introducing the response rejection utility! Webhook egress plugin returns a more usable data structure. Minor bug fixes included.
- Updated dependencies [6259301]
  - @flatfile/plugin-job-handler@0.1.2

## 0.1.0

### Minor Changes

- 69fd41c: Introducing the new JobHandler plugin and the new SpaceConfigure plugin, as well as a new utilities for log message formatting.

### Patch Changes

- Updated dependencies [69fd41c]
  - @flatfile/plugin-job-handler@0.1.0
