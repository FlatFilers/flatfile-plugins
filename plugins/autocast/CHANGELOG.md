# @flatfile/plugin-autocast

## 0.7.6

### Patch Changes

- 16f314f: This release fixes the builds of plugins utilizing the recordHook package by including recordHook as an external. This also moves the listener dep to peerDependencies which are considered externals.
- Updated dependencies [16f314f]
  - @flatfile/plugin-record-hook@1.4.5

## 0.7.5

### Patch Changes

- 40108fd: This release adds string casting to the autocast plugin.

## 0.7.4

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0
  - @flatfile/plugin-record-hook@1.4.4

## 0.7.3

### Patch Changes

- f53ecd8: This release makes the autocast error message friendlier for non-technical users.

## 0.7.2

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/plugin-record-hook@1.4.3
  - @flatfile/util-common@0.4.2

## 0.7.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser
- Updated dependencies [4a417af]
  - @flatfile/plugin-record-hook@1.4.1
  - @flatfile/util-common@0.4.1

## 0.7.0

### Minor Changes

- 7c1c094: Update package.json exports

### Patch Changes

- Updated dependencies [7c1c094]
- Updated dependencies [7c1c094]
  - @flatfile/plugin-record-hook@1.4.0
  - @flatfile/util-common@0.4.0

## 0.6.0

### Minor Changes

- 94e245a: This release upgrades the messaging when a value is cast. It also fixes a bug when the autocast plugin is used concurrently with recordHooks.

## 0.5.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/plugin-record-hook@1.3.0
  - @flatfile/util-common@0.3.0

## 0.4.1

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
- Updated dependencies [97ffa1c]
  - @flatfile/plugin-record-hook@1.2.1
  - @flatfile/util-common@0.2.5

## 0.4.0

### Minor Changes

- 9d36229: Switch build tools to rollup. Builds from rollup for CDN builds to be included.

### Patch Changes

- Updated dependencies [9d36229]
  - @flatfile/plugin-record-hook@1.2.0

## 0.3.4

### Patch Changes

- 37873a4: Bug fix

## 0.3.3

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- Updated dependencies [28820d5]
  - @flatfile/plugin-record-hook@1.1.12
  - @flatfile/util-common@0.2.3

## 0.3.2

### Patch Changes

- cb25574: Update @flatfile/api dependency
- Updated dependencies [cb25574]
  - @flatfile/plugin-record-hook@1.1.6

## 0.3.1

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version
- Updated dependencies [f2b2f59]
  - @flatfile/plugin-record-hook@1.1.4

## 0.3.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/plugin-record-hook@1.1.0
  - @flatfile/util-common@0.2.0

## 0.2.2

### Patch Changes

- 3e28c51: Fix for date casting

## 0.2.1

### Patch Changes

- ccbbbc9: Fix sheet filtering options to require sheetSlug.

## 0.2.0

### Minor Changes

- 966cf91: This release introduces field filters, and enables filtering by either sheetId or sheetSlug.

## 0.1.0

### Minor Changes

- 15dc4fe: Introduction of the autocast plugin!

### Patch Changes

- Updated dependencies [15dc4fe]
  - @flatfile/plugin-record-hook@1.0.4

## 0.0.4

### Patch Changes

- 7fa7925: updating readmes
