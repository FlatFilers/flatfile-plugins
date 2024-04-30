# @flatfile/plugin-webhook-egress

## 1.3.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/util-response-rejection@1.3.1
  - @flatfile/plugin-job-handler@0.5.1
  - @flatfile/util-common@1.3.1

## 1.3.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-response-rejection@1.3.0
  - @flatfile/plugin-job-handler@0.5.0
  - @flatfile/util-common@1.3.0

## 1.2.7

### Patch Changes

- 6567f6c: Add package keywords and readme content

## 1.2.6

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-response-rejection@1.2.5
  - @flatfile/plugin-job-handler@0.4.2
  - @flatfile/util-common@1.1.1

## 1.2.5

### Patch Changes

- 87711c6: `@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

  This release also includes bundling fixes across the Flatfile plugin ecosystem.

- Updated dependencies [87711c6]
  - @flatfile/util-response-rejection@1.2.4
  - @flatfile/plugin-job-handler@0.4.1
  - @flatfile/util-common@1.0.3

## 1.2.4

### Patch Changes

- Updated dependencies [ed308f5]
  - @flatfile/plugin-job-handler@0.4.0
  - @flatfile/util-common@1.0.2

## 1.2.3

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0
  - @flatfile/util-response-rejection@1.2.3
  - @flatfile/plugin-job-handler@0.3.3

## 1.2.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-response-rejection@1.2.2
  - @flatfile/plugin-job-handler@0.3.2
  - @flatfile/util-common@0.4.2

## 1.2.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser
- Updated dependencies [4a417af]
  - @flatfile/util-response-rejection@1.2.1
  - @flatfile/plugin-job-handler@0.3.1
  - @flatfile/util-common@0.4.1

## 1.2.0

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- Updated dependencies [7c1c094]
  - @flatfile/util-response-rejection@1.2.0
  - @flatfile/plugin-job-handler@0.3.0
  - @flatfile/util-common@0.4.0

## 1.1.2

### Patch Changes

- 0d63b1f: This release add browser builds to the `@flatfile/util-response-rejection`, `@flatfile/plugin-webhook-egress`, `@flatfile/plugin-job-handler` & `@flatfile/util-common` plugins can be used in client-side apps.
- Updated dependencies [0d63b1f]
  - @flatfile/util-response-rejection@1.1.1
  - @flatfile/plugin-job-handler@0.2.1
  - @flatfile/util-common@0.3.1

## 1.1.1

### Patch Changes

- 9aa56ac: Update axios dependency

## 1.1.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-response-rejection@1.1.0
  - @flatfile/plugin-job-handler@0.2.0
  - @flatfile/util-common@0.3.0

## 1.0.0

### Major Changes

- 75ea05d: Upgrade to the @flatfile/util-response-rejection plugin to support deleting successfully submitted records or adding a status column to indicate successful/rejected records.

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
- Updated dependencies [75ea05d]
- Updated dependencies [97ffa1c]
  - @flatfile/util-response-rejection@1.0.0
  - @flatfile/plugin-job-handler@0.1.7
  - @flatfile/util-common@0.2.5

## 0.1.5

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- Updated dependencies [28820d5]
- Updated dependencies [edaedf5]
  - @flatfile/util-response-rejection@0.1.4
  - @flatfile/plugin-job-handler@0.1.5
  - @flatfile/util-common@0.2.3

## 0.1.4

### Patch Changes

- cb25574: Update @flatfile/api dependency
- Updated dependencies [cb25574]
  - @flatfile/util-response-rejection@0.1.3
  - @flatfile/plugin-job-handler@0.1.4

## 0.1.3

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version
- Updated dependencies [f2b2f59]
  - @flatfile/util-response-rejection@0.1.2
  - @flatfile/plugin-job-handler@0.1.3

## 0.1.2

### Patch Changes

- 134cf31: Minor bug fixes
- Updated dependencies [134cf31]
  - @flatfile/util-common@0.2.1

## 0.1.1

### Patch Changes

- 3fbf53a: Update response rejection message
- Updated dependencies [3fbf53a]
  - @flatfile/util-response-rejection@0.1.1

## 0.1.0

### Minor Changes

- 6259301: Introducing the response rejection utility! Webhook egress plugin returns a more usable data structure. Minor bug fixes included.

### Patch Changes

- Updated dependencies [6259301]
  - @flatfile/util-response-rejection@0.1.0
  - @flatfile/plugin-job-handler@0.1.2

## 0.0.1

### Patch Changes

- f6a3a2b: Introducing the @flatfile/plugin-webhook-egress plugin!
