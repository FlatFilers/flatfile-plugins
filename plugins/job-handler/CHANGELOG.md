# @flatfile/plugin-job-handler

## 0.5.5

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/util-common@1.3.8

## 0.5.4

### Patch Changes

- ebf726e: This release fixes error handling when the callback function returns an invalid job outcome.

## 0.5.3

### Patch Changes

- cf24f9b: This release changes the jobHandler's starting progress from 10% to 1%

## 0.5.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/util-common@1.3.2

## 0.5.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/util-common@1.3.1

## 0.5.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-common@1.3.0

## 0.4.3

### Patch Changes

- 9c905ce: Add readme and keywords for core plugins

## 0.4.2

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-common@1.1.1

## 0.4.1

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/util-common@1.0.3

## 0.4.0

### Minor Changes

- ed308f5: `@flatfile/plugin-dedupe`: This release improves dedupe's handling of records. Previously it only deduped the first 10k records. Now it dedupes the entire sheet. It takes advantage of the `processRecords` utility for retrieving and finding duplicates, and creates a bulk record deletion job. Additionally it improves error messaging and bundles for both NodeJS and the browser.

  `@flatfile/plugin-job-handler`: This release updates `jobHandler`'s job parameter to allow passing an `EventFilter`.

  `@flatfile/util-common`: This release fixes cross compatibility issues by using `@flatfile/cross-env-config` to retrieve environment variables.

### Patch Changes

- Updated dependencies [ed308f5]
  - @flatfile/util-common@1.0.2

## 0.3.3

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0

## 0.3.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-common@0.4.2

## 0.3.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser
- Updated dependencies [4a417af]
  - @flatfile/util-common@0.4.1

## 0.3.0

#### 2024-02-07

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- Updated dependencies [7c1c094]
  - @flatfile/util-common@0.4.0

## 0.2.1

#### 2024-02-05

### Patch Changes

- 0d63b1f: This release adds browser builds to the `@flatfile/util-response-rejection`, `@flatfile/plugin-webhook-egress`, `@flatfile/plugin-job-handler` & `@flatfile/util-common` plugins can be used in client-side apps.
- Updated dependencies [0d63b1f]
  - @flatfile/util-common@0.3.1

## 0.2.0

#### 2024-01-09

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-common@0.3.0

## 0.1.7

#### 2023-12-18

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d] [97ffa1c]
  - @flatfile/util-common@0.2.5

## 0.1.6

#### 2023-11-28

### Patch Changes

- 3d31680: Display Modal instead of a Toast on Job error

## 0.1.5

#### 2023-11-09

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- edaedf5: Fix tick params
- Updated dependencies [28820d5]
  - @flatfile/util-common@0.2.3

## 0.1.4

#### 2023-10-10

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.1.3

#### 2023-09-27

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.1.2

#### 2023-09-17

### Patch Changes

- 6259301: Introducing the response rejection utility! Webhook egress plugin returns a more usable data structure. Minor bug fixes included.

## 0.1.1

#### 2023-09-08

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/util-common@0.2.0

## 0.1.0

#### 2023-08-30

### Minor Changes

- 69fd41c: Introducing the new JobHandler plugin and the new SpaceConfigure plugin, as well as new utilities for log message formatting.

### Patch Changes

- Updated dependencies [69fd41c]
  - @flatfile/util-common@0.1.0
