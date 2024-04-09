# @flatfile/plugin-space-configure

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
