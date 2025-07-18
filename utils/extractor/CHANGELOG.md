# @flatfile/plugin-extractor-utils

## 2.7.1

### Patch Changes

- aab6964: Added AI Header Detection using header detection api endpoint in excel extractor

## 2.7.0

### Minor Changes

- 8124a46: New Smart Extract workflow. Removed check

## 2.6.3

### Patch Changes

- 58d93ad: Fixed file treatment check case issue

## 2.6.2

### Patch Changes

- 905d9e3: Updated file.treatment check for isBasicFileShape

## 2.6.1

### Patch Changes

- 815352f: This release fixes an issue when a sheet contains no discernible content/headers.

## 2.6.0

### Minor Changes

- f89ccc0: When smart extractor is enabled we won't create an excel extractor job because smart extractor handles excel files.

## 2.5.0

### Minor Changes

- 40717d0: This release adds job message translations

## 2.4.1

### Patch Changes

- ad94b22: This release adds a brief delay to the view-mapped plugin prior to updating the workbook's fields. Additionally fixes a dead link in util-extractor.

## 2.4.0

### Minor Changes

- 7ef4cd3: This release adds support for JSONL files in the JSON Extractor plugin.

## 2.3.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [fe21d6e]
  - @flatfile/util-file-buffer@0.6.0
  - @flatfile/util-common@1.6.0

## 2.2.1

### Patch Changes

- 615542b: This release fixes misc bugs

## 2.2.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/util-file-buffer@0.5.0
  - @flatfile/util-common@1.5.0

## 2.1.7

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/util-file-buffer@0.4.1
  - @flatfile/util-common@1.4.1

## 2.1.6

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/util-file-buffer@0.4.0
  - @flatfile/util-common@1.4.0

## 2.1.5

### Patch Changes

- 7667dd0: This release fixes an issue when using `raw` or `rawNumbers` with non-string values in the header row.

## 2.1.4

### Patch Changes

- 2dd0364: Auto enables the allowAdditionalFields on sheets when sourceEditor entitlement is on

## 2.1.3

### Patch Changes

- 65da741: Updated @flatfile/util-common dependancy version to fix extraction error

## 2.1.2

### Patch Changes

- 78efe6c: adds a small delay before writing and uses an IO optimized writer

## 2.1.1

### Patch Changes

- Escape keys with special characters

## 2.1.0

### Minor Changes

- d714273: Normalizes extracted column keys

## 2.0.1

### Patch Changes

- 57bf814: Added Treatments to extracted files. Used internally for identification.

## 2.0.0

### Major Changes

- a6e764b: Removed the 'Required' field check from extractors and the subsequent field.constraints.required.
  This is a breaking change if you are using this required field check in your implementation.

  Source sheets don't require the field.constraints.required.

  If you need to implement this functionality you can use a listener to add in the field.constraints.required to the specific fields you need.

## 1.0.1

### Patch Changes

- baf8ef0: Update to entitlement call

## 1.0.0

### Major Changes

- a78b608: This release supports a new Platform feature for header selection.

## 0.6.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/util-file-buffer@0.3.2
  - @flatfile/util-common@1.3.2

## 0.6.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/util-file-buffer@0.3.1
  - @flatfile/util-common@1.3.1

## 0.6.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-file-buffer@0.3.0
  - @flatfile/util-common@1.3.0

## 0.5.8

### Patch Changes

- b2984b1: This release sets the extracted sheet's slug.
- Updated dependencies [b2984b1]
  - @flatfile/util-common@1.2.0

## 0.5.7

### Patch Changes

- 59099ae: Add package keywords and readme content to utils
- Updated dependencies [59099ae]
  - @flatfile/util-file-buffer@0.2.3

## 0.5.6

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-file-buffer@0.2.2
  - @flatfile/util-common@1.1.1

## 0.5.5

### Patch Changes

- c92f126: This release correctly sets the file's status based on the success of extraction

## 0.5.4

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0

## 0.5.3

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-file-buffer@0.2.1
  - @flatfile/util-common@0.4.2

## 0.5.2

### Patch Changes

- Updated dependencies [7c1c094]
  - @flatfile/util-common@0.4.0

## 0.5.1

### Patch Changes

- 69e1a67: This release fixes several issues related to large Excel file extractions. Previously the SheetJS library would quietly fail when attempting to parse large files. This release turns SheetJS's logging and listens for the ERR_STRING_TOO_LONG which indicates the file is too large to parse. When this occurs, the plugin will now throw an error with a message indicating the file is too large.

  Additionally, a bug was fixed where the extraction job was not being immediately acknowledged. This resulted in a message indicating that `no listener has been configured to respond to it`. This has been fixed and the extraction job will now be acknowledged immediately.

  A new `dateNF` option has been added to the plugin. This option allows you to specify the date format that should be used when parsing dates from the Excel file.

  Finally, the default record insertion chunk size has been decreased from 10,000 to 5,000 to reflect the new default chunk size in the Flatfile Platform.

- Updated dependencies [0d63b1f]
  - @flatfile/util-common@0.3.1

## 0.5.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-file-buffer@0.2.0
  - @flatfile/util-common@0.3.0

## 0.4.10

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
- Updated dependencies [97ffa1c]
  - @flatfile/util-file-buffer@0.1.4
  - @flatfile/util-common@0.2.5

## 0.4.9

### Patch Changes

- c39cc51: Fix for xlsx extraction when file contains empty sheets

## 0.4.8

### Patch Changes

- c93b2d9: Improved header detection options.

## 0.4.7

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- edaedf5: Fix tick params
- Updated dependencies [28820d5]
  - @flatfile/util-file-buffer@0.1.3
  - @flatfile/util-common@0.2.3

## 0.4.6

### Patch Changes

- cb25574: Update @flatfile/api dependency
- Updated dependencies [cb25574]
  - @flatfile/util-file-buffer@0.1.2

## 0.4.5

### Patch Changes

- f5cfe69: Change import method

## 0.4.4

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version
- Updated dependencies [f2b2f59]
  - @flatfile/util-file-buffer@0.1.1

## 0.4.3

### Patch Changes

- 0195166: Fix job progress bug

## 0.4.2

### Patch Changes

- 134cf31: Minor bug fixes
- Updated dependencies [134cf31]
  - @flatfile/util-common@0.2.1

## 0.4.1

### Patch Changes

- 7019e58: Add job progress to extractors

## 0.4.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/util-file-buffer@0.1.0
  - @flatfile/util-common@0.2.0

## 0.3.0

### Minor Changes

- 447691a: Add configurable batch options

## 0.2.4

### Patch Changes

- Updated dependencies [69fd41c]
  - @flatfile/util-common@0.1.0

## 0.2.3

### Patch Changes

- f5efd60: Update @flatfile/listener dependency
- Updated dependencies [f5efd60]
  - @flatfile/util-file-buffer@0.0.4

## 0.2.2

### Patch Changes

- Updated dependencies [490e8f1]
  - @flatfile/util-file-buffer@0.0.3

## 0.2.1

### Patch Changes

- c859a10: Extract asyncBatch to a utility package
- Updated dependencies [c859a10]
  - @flatfile/util-common@0.0.2

## 0.2.0

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor and use custom parsers. Add .tsv file extractor and a generic delimiter extractor. Add header row detection to the Excel extractor.

## 0.1.0

### Minor Changes

- e7e5134: DRYing abstract extractor code
