# @flatfile/plugin-view-mapped

## 1.3.2

### Patch Changes

- ad94b22: This release adds a brief delay to the view-mapped plugin prior to updating the workbook's fields. Additionally fixes a dead link in util-extractor.

## 1.3.1

### Patch Changes

- 2461428: This release fixes a bug in the view-mapped plugin when multiple sheets have fields with the same key by limiting the view-mapped update to the sheet being mapped. Additionally, the view-mapped plugin now only runs when the `trackChanges` setting in the workbook is enabled to prevent a race condition where the view-mapped plugin runs before hooks have completed.

## 1.3.0

### Minor Changes

- c71a101: This release add message translations to the view-mapped plugin.

## 1.2.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [fe21d6e]
  - @flatfile/plugin-job-handler@0.8.0
  - @flatfile/util-common@1.6.0

## 1.1.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/plugin-job-handler@0.7.0
  - @flatfile/util-common@1.5.0

## 1.0.4

### Patch Changes

- e77d0e3: This release turns off job acknowledgement

## 1.0.3

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support

## 1.0.2

### Patch Changes

- 54b66c4: Initial Release

## 1.0.0

### Patch Changes

- initial version
