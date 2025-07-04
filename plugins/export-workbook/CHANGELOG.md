# @flatfile/plugin-export-workbook

## 5.2.1

### Patch Changes

- 8f6b2f3: This release adds compression to the outputted excel file

## 5.2.0

### Minor Changes

- 77c7be2: This release adds an option to provided a file name

## 5.1.0

### Minor Changes

- b1c26f8: Added option to export workbook without record messages

## 5.0.0

### Major Changes

- d6bef61: Added options to adjust the origin and column headers

## 4.0.1

### Patch Changes

- d3f8ba6: This release adds a type for the tick() function.
- Updated dependencies [d3f8ba6]
  - @flatfile/plugin-job-handler@0.8.1

## 4.0.0

### Patch Changes

- Updated dependencies [ee80aa8]
  - @flatfile/util-common@1.7.0

## 3.0.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [fe21d6e]
  - @flatfile/plugin-job-handler@0.8.0
  - @flatfile/util-common@1.6.0

## 2.1.0

### Minor Changes

- c55a4e3: This release updates the plugin's documentation.

## 2.0.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/plugin-job-handler@0.7.0
  - @flatfile/util-common@1.5.0

## 1.0.1

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/plugin-job-handler@0.6.1
  - @flatfile/util-common@1.4.1

## 1.0.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-job-handler@0.6.0
  - @flatfile/util-common@1.4.0

## 0.3.1

### Patch Changes

- 37babea: Update @flatfile/api dependency
- Updated dependencies [37babea]
  - @flatfile/plugin-job-handler@0.5.5
  - @flatfile/util-common@1.3.8

## 0.3.0

### Minor Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

### Patch Changes

- Updated dependencies [1d253d8]
  - @flatfile/plugin-job-handler@0.5.2
  - @flatfile/util-common@1.3.2

## 0.2.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/util-common@1.3.1

## 0.2.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-common@1.3.0

## 0.1.9

### Patch Changes

- 0ea5a28: This release updates the SheetJS dependency to resolve a security issue.

## 0.1.8

### Patch Changes

- 6567f6c: Add package keywords and readme content

## 0.1.7

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
- Updated dependencies [e9ea2d8]
  - @flatfile/util-common@1.1.1

## 0.1.6

### Patch Changes

- f168f4d: This release fixes a break in backwards compatability created by the previous release

## 0.1.5

### Patch Changes

- c1018d5: Excel places size and character limitations on worksheet names. This release strips invalid characters from the sheet name.

## 0.1.4

### Patch Changes

- Updated dependencies [feb2ced]
  - @flatfile/util-common@1.0.0

## 0.1.3

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-common@0.4.2

## 0.1.2

#### 2024-02-07

### Patch Changes

- Updated dependencies [7c1c094]
  - @flatfile/util-common@0.4.0

## 0.1.1

#### 2024-01-19

### Patch Changes

- 2849070: Write tmp file to /tmp dir

## 0.1.0

#### 2024-01-09

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-common@0.3.0

## 0.0.11

#### 2023-12-18

### Patch Changes

- 7a0073d: Dependency cleanup
- 97ffa1c: Export workbook plugin bug fix for handling multiple comments on a cell
- Updated dependencies [7a0073d]
- Updated dependencies [97ffa1c]
  - @flatfile/util-common@0.2.5

## 0.0.10

#### 2023-11-09

### Patch Changes

- 28820d5: Release to update @flatfile/api dep

## 0.0.9

#### 2023-10-19

### Patch Changes

- 59cb901: Export parsers

## 0.0.8

#### 2023-10-18 (21:04)

### Patch Changes

- 53003e9: Add "Next" url to job completion message

## 0.0.7

#### 2023-10-18 (17:25)

### Patch Changes

- 20affc9: add option flag to export recordId
  fix column pattern generator
  pass column count to generator per sheet
  properly fail jobs on error
  delete files after upload

## 0.0.6

#### 2023-10-17

### Patch Changes

- 4435151: Include recordId in export

## 0.0.5

#### 2023-10-10

### Patch Changes

- cb25574: Update @flatfile/api dependency

## 0.0.4

#### 2023-09-27

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 0.0.3

#### 2023-09-21

### Patch Changes

- 134cf31: Minor bug fixes

## 0.0.2

#### 2023-08-25

### Patch Changes

- f5efd60: Update @flatfile/listener dependency

## 0.0.1

#### Created Date (if applicable)

### Patch Changes

- 351ff28: Initial release
