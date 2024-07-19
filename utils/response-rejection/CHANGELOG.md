# @flatfile/util-response-rejection

## 1.3.4

### Patch Changes

- f9f1cca: Ensures proper order when response rejection is used with a Record Hook

## 1.3.3

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/util-common@1.3.2

## 1.3.2

### Patch Changes

- 816f871: This release fixes the deletion of valid records when the deleteSubmitted flag is "true" in the response-rejection response.

## 1.3.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/util-common@1.3.1

## 1.3.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-common@1.3.0

## 1.2.7

### Patch Changes

- 7424e3c: This release resolves a bug that prevented the submission status of valid fields from being updated correctly.

## 1.2.6

### Patch Changes

- 59099ae: Add package keywords and readme content to utils

## 1.2.5

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-common@1.1.1

## 1.2.4

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/util-common@1.0.3

## 1.2.3

### Patch Changes

- feb2ced: @flatfile/util-common: This release provides additional record request options such as "filter" and passes the current pageNumber to the cb function. Additionally the cb will be called when no records are found for any wrap-up the cb needs to make.

  @flatfile/util-response-rejection: Since @flatfile/util-common now calls the cb when no records are found, this release updates @flatfile/util-response-rejection to check for records before processing.

  ```

  ```

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0

## 1.2.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-common@0.4.2

## 1.2.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser
- Updated dependencies [4a417af]
  - @flatfile/util-common@0.4.1

## 1.2.0

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- Updated dependencies [7c1c094]
  - @flatfile/util-common@0.4.0

## 1.1.1

### Patch Changes

- 0d63b1f: This release add browser builds to the `@flatfile/util-response-rejection`, `@flatfile/plugin-webhook-egress`, `@flatfile/plugin-job-handler` & `@flatfile/util-common` plugins can be used in client-side apps.
- Updated dependencies [0d63b1f]
  - @flatfile/util-common@0.3.1

## 1.1.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-common@0.3.0

## 1.0.1

### Patch Changes

- e283ef6: Bug fix

## 1.0.0

### Major Changes

- 75ea05d: Upgrade to the @flatfile/util-response-rejection plugin to support deleting successfully submitted records or adding a status column to indicate successful/rejected records.

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
- Updated dependencies [97ffa1c]
  - @flatfile/util-common@0.2.5

## 0.1.4

### Patch Changes

- 28820d5: Release to update @flatfile/api dep

## 0.1.3

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.1.2

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.1.1

### Patch Changes

- 3fbf53a: Update response rejection message

## 0.1.0

### Minor Changes

- 6259301: Introducing the response rejection utility! Webhook egress plugin returns a more usable data structure. Minor bug fixes included.
