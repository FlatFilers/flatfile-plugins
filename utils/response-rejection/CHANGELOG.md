# @flatfile/util-response-rejection

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
