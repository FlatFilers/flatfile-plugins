# @flatfile/plugin-xlsx-extractor

## 4.0.6

### Patch Changes

- 0cd752f: Fixes raw:true config type error

## 4.0.5

### Patch Changes

- aab6964: Added AI Header Detection using header detection api endpoint in excel extractor
- Updated dependencies [aab6964]
  - @flatfile/util-extractor@2.7.1

## 4.0.4

### Patch Changes

- 962e64f: Uitl Extractor version push for xlsx extractor

## 4.0.3

### Patch Changes

- 35ef80c: Update util extractor version

## 4.0.2

### Patch Changes

- d0edb9e: Updated util version

## 4.0.1

### Patch Changes

- 815352f: This release fixes an issue when a sheet contains no discernible content/headers.
- Updated dependencies [815352f]
  - @flatfile/util-extractor@2.6.1

## 4.0.0

### Major Changes

- b3fa0a1: - Added merged cell handling options to control how merged cells are processed during extraction
  - Added support for different treatments based on merge type (across columns, rows, or ranges)
  - Added options to apply values to all cells, top-left cell only, coalesce, or concatenate values
  - Added cascadeRowValues option to automatically cascade values down the dataset until a blank row, new value, or end of dataset
  - Added cascadeHeaderValues option to automatically cascade values across header rows until a blank column, new value, or end of dataset
  - These features improve handling of hierarchical data and multi-level headers in Excel files

## 3.5.1

### Patch Changes

- f648488: Add edge-case handling to DataRowAndSubHeaderDetection fix issue when `raw` or `rawNumbers` options are enabled

## 3.5.0

### Minor Changes

- 40717d0: This release adds job message translations

### Patch Changes

- Updated dependencies [40717d0]
  - @flatfile/util-extractor@2.5.0

## 3.4.2

### Patch Changes

- 6b17584: This release fixes XLSX file extraction when the file contains empty sheets

## 3.4.1

### Patch Changes

- 62d2bf3: This release fixes trims the header row to the last non-null header cell

## 3.4.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [fe21d6e]
  - @flatfile/util-extractor@2.3.0

## 3.3.1

### Patch Changes

- 615542b: This release fixes misc bugs
- Updated dependencies [615542b]
  - @flatfile/util-extractor@2.2.1

## 3.3.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/util-extractor@2.2.0

## 3.2.2

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/util-extractor@2.1.7

## 3.2.1

### Patch Changes

- 64bd26a: Update to documentation

## 3.2.0

### Minor Changes

- 7c92e15: This release provides a new option `skipEmptyLines` to skip empty lines.

## 3.1.5

### Patch Changes

- 7667dd0: This release fixes an issue when using `raw` or `rawNumbers` with non-string values in the header row.
- Updated dependencies [7667dd0]
  - @flatfile/util-extractor@2.1.5

## 3.1.4

### Patch Changes

- 65da741: Updated util-common dependancy version to fix extraction error
- Updated dependencies [65da741]
  - @flatfile/util-extractor@2.1.3

## 3.1.3

### Patch Changes

- Update extractors to use common util

## 3.1.2

### Patch Changes

- 54cb084: Updated extractor to convert null header values into empty, empty_1, etc.

## 3.1.1

### Patch Changes

- 860ee0e: Update to use the latest @flatfile/util-extractor@2.1.1
- 611b3e3: Fixes record extraction in the presence of empty columns

## 3.1.0

### Minor Changes

- db1ab4a: Update to use the latest @flatfile/util-extractor@2.1.0

## 3.0.1

### Patch Changes

- cbb06cc: Update util-extrator dependency.

## 3.0.0

### Major Changes

- a6e764b: Removed the 'Required' field check from extractors and the subsequent field.constraints.required.
  This is a breaking change if you are using this required field check in your implementation.

  Source sheets don't require the field.constraints.required.

  If you need to implement this functionality you can use a listener to add in the field.constraints.required to the specific fields you need.

### Patch Changes

- Updated dependencies [a6e764b]
  - @flatfile/util-extractor@2.0.0

## 2.0.1

### Patch Changes

- 1112838: Updating dependencies

## 2.0.0

### Major Changes

- a78b608: This release supports a new Platform feature for header selection.

### Patch Changes

- Updated dependencies [a78b608]
  - @flatfile/util-extractor@1.0.0

## 1.11.10

### Patch Changes

- e1e79a9: This release reattempts to read XLSX files that may have emitted an error that could be handled.

## 1.11.9

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-extractor@0.6.0

## 1.11.8

### Patch Changes

- a4666a6: Add readme content and package keywords

## 1.11.7

### Patch Changes

- 0ea5a28: This release updates the SheetJS dependency to resolve a security issue.

## 1.11.6

### Patch Changes

- 9342781: This release adds better messaging when in debug mode.

## 1.11.5

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-extractor@0.5.6

## 1.11.4

### Patch Changes

- c632128: This release fixes a bug in @flatfile/plugin-excel-extractor when using the explicitHeaders header detection algorithm.

## 1.11.3

### Patch Changes

- 6cc4ac2: This release fixes column selection when there is a blank header column by removing the column with a blank header rather than the last column.
- Updated dependencies [c92f126]
  - @flatfile/util-extractor@0.5.5

## 1.11.2

### Patch Changes

- cf6925c: This release improves the error messaging when extracting password-protected Excel files

## 1.11.1

#### 2024-02-05

### Patch Changes

- 69e1a67: Fixes issues related to large Excel file extractions and improves error handling for large files. Introduces `dateNF` option for specifying date format in Excel files.
- Updated dependencies [69e1a67]
  - @flatfile/util-extractor@0.5.1

## 1.11.0

#### 2024-01-19

### Minor Changes

- 3b25c6a: @flatfile/plugin-delimiter-extractor can now guess the delimiter. Enhanced header detection logic.

## 1.10.0

#### 2024-01-09

### Minor Changes

- 30981b2: Dependency updates.
- Updated dependencies [30981b2]
  - @flatfile/util-extractor@0.5.0

## 1.9.2

#### 2023-12-18

### Patch Changes

- 7a0073d: Dependency cleanup.
- Updated dependencies [7a0073d]
  - @flatfile/util-extractor@0.4.10

## 1.9.1

#### 2023-12-12

### Patch Changes

- c39cc51: Fixes xlsx extraction issue with empty sheets.
- Updated dependencies [c39cc51]
  - @flatfile/util-extractor@0.4.9

## 1.9.0

#### 2023-12-08

### Minor Changes

- c93b2d9: Improved header detection options.
- Updated dependencies [c93b2d9]
  - @flatfile/util-extractor@0.4.8

## 1.8.2

#### 2023-11-09

### Patch Changes

- 28820d5: Release to update @flatfile/api dependency.
- Updated dependencies [28820d5]
  - @flatfile/util-extractor@0.4.7

## 1.8.1

#### 2023-10-19

### Patch Changes

- 59cb901: Export parsers.

## 1.8.0

#### 2023-10-17

### Minor Changes

- 2aaae2f: Expose `raw` option for raw data display.

## 1.7.7

#### 2023-10-10

### Patch Changes

- cb25574: Update @flatfile/api dependency.
- Updated dependencies [cb25574]
  - @flatfile/util-extractor@0.4.6

## 1.7.6

#### 2023-09-27

### Patch Changes

- Updated dependencies [f5cfe69]
  - @flatfile/util-extractor@0.4.5

## 1.7.5

#### 2023-09-26

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version.
- Updated dependencies [f2b2f59]

  - @flatfile/util-extractor@0.4.4

  ## 1.7.4

#### 2023-09-22

### Patch Changes

- e111565: Update XLSX dependency version.

## 1.7.3

#### 2023-09-21

### Patch Changes

- Updated dependencies [0195166]
  - @flatfile/util-extractor@0.4.3

## 1.7.2

#### 2023-09-19

### Patch Changes

- Updated dependencies [134cf31]
  - @flatfile/util-extractor@0.4.2

## 1.7.1

#### 2023-09-08

### Patch Changes

- Updated dependencies [7019e58]
  - @flatfile/util-extractor@0.4.1

## 1.7.0

#### 2023-08-30

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready. Add debug option.
- Updated dependencies [b399623]
  - @flatfile/util-extractor@0.4.0

## 1.6.0

#### 2023-08-30

### Minor Changes

- 447691a: Add configurable batch options.
- Updated dependencies [447691a]
  - @flatfile/util-extractor@0.3.0

## 1.5.3

#### 2023-08-25

### Patch Changes

- @flatfile/util-extractor@0.2.4

## 1.5.2

#### 2023-08-24

### Patch Changes

- f5efd60: Update @flatfile/listener dependency.
- Updated dependencies [f5efd60]
  - @flatfile/util-extractor@0.2.3

## 1.5.1

#### 2023-08-11

### Patch Changes

- @flatfile/util-extractor@0.2.2

## 1.5.0

#### 2023-08-09

### Minor Changes

- c0b8d8d: Support duplicate headers with non-unique header keys.

## 1.4.0

#### 2023-08-02

### Minor Changes

- 6189d31: Fix for ghost rows in Excel files.

## 1.3.2

#### 2023-08-02

### Patch Changes

- 1cd2f31: Add header row auto-detection.
- Updated dependencies [c859a10]
  - @flatfile/util-extractor@0.2.1

## 1.3.1

#### 2023-07-31

### Patch Changes

- 4651120: Add @deprecated comment.

## 1.3.0

#### 2023-07-25

### Minor Changes

- 77b9237: Add backwards compatibility for renamed extractors.

## 1.2.0

#### 2023-07-18

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor. Add .tsv file extractor.
- Updated dependencies [2b15b32]
  - @flatfile/util-extractor@0.2.0

## 1.1.0

#### 2023-06-30

### Minor Changes

- e7e5134: DRYing abstract extractor code.
- Updated dependencies [e7e5134]
  - @flatfile/plugin-extractor-utils@0.1.0

## 1.0.8

#### 2023-06-23

### Patch Changes

- 3656390: Open up the event typing.

## 1.0.7

#### 2023-06-18

### Patch Changes

- 02b9420: Fixes issue with extracting export files.

## 1.0.6

#### 2023-06-15

### Patch Changes

- c4bf511: Console log not error. New extractor for psv file types.

## 1.0.4

#### 2023-06-13

### Patch Changes

- 749ebdc: Introduce records chunking to xlsx extractor.

## 1.0.3

#### 2023-06-08

### Patch Changes

- 7fa7925: Updating readmes.

## 1.0.2

#### 2023-05-23

### Patch Changes

- 413251a: Progress Improvements and adds xlsxExtractorPlugin.

## 1.0.1

#### 2023-04-17

### Patch Changes

- 41261d0: Build tooling
