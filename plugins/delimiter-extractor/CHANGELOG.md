# @flatfile/plugin-delimiter-extractor

## 2.5.0

### Minor Changes

- fe21d6e: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [fe21d6e]
  - @flatfile/util-extractor@2.3.0

## 2.4.0

### Minor Changes

- c55a4e3: This release updates the plugin's documentation.

## 2.3.1

### Patch Changes

- 615542b: This release fixes misc bugs
- Updated dependencies [615542b]
  - @flatfile/util-extractor@2.2.1

## 2.3.0

### Minor Changes

- 3b9eedd: The release swaps the package's bundler to tsup.

### Patch Changes

- Updated dependencies [3b9eedd]
  - @flatfile/util-extractor@2.2.0

## 2.2.3

### Patch Changes

- 41bfa99: This release fixes an async bug

## 2.2.2

### Patch Changes

- 1fd8a88: This release updates the @flatfile/api dependency to improve regional support
- Updated dependencies [1fd8a88]
  - @flatfile/util-extractor@2.1.7

## 2.2.1

### Patch Changes

- 64bd26a: Update to documentation

## 2.2.0

### Minor Changes

- 7c92e15: This release provides a new option `skipEmptyLines` to skip empty lines.

## 2.1.3

### Patch Changes

- 37babea: Update @flatfile/api dependency

## 2.1.2

### Patch Changes

- Update extractors to use common util

## 2.1.1

### Patch Changes

- 860ee0e: Update to use the latest @flatfile/util-extractor@2.1.1

## 2.1.0

### Minor Changes

- db1ab4a: Update to use the latest @flatfile/util-extractor@2.1.0

## 2.0.1

### Patch Changes

- cbb06cc: Update util-extrator dependency.

## 2.0.0

### Major Changes

- a6e764b: Removed the 'Required' field check from extractors and the subsequent field.constraints.required.
  This is a breaking change if you are using this required field check in your implementation.

  Source sheets don't require the field.constraints.required.

  If you need to implement this functionality you can use a listener to add in the field.constraints.required to the specific fields you need.

### Patch Changes

- Updated dependencies [a6e764b]
  - @flatfile/util-extractor@2.0.0

## 1.0.1

### Patch Changes

- 1112838: Updating dependencies

## 1.0.0

### Major Changes

- a78b608: This release supports a new Platform feature for header selection.

### Patch Changes

- Updated dependencies [a78b608]
  - @flatfile/util-extractor@1.0.0

## 0.10.2

### Patch Changes

- 1d253d8: This release updates the @flatfile/api dependency on all plugins.

  @flatfile/plugin-export-workbook: a new option has been added to the plugin to automatically download the file after exporting.

- Updated dependencies [1d253d8]
  - @flatfile/util-extractor@0.6.2

## 0.10.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/util-extractor@0.6.1

## 0.10.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/util-extractor@0.6.0

## 0.9.2

### Patch Changes

- a4666a6: Add readme content and package keywords

## 0.9.1

### Patch Changes

- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies
- Updated dependencies [c7f2d69]
  - @flatfile/util-extractor@0.5.3

## 0.9.0

### Minor Changes

- 3b25c6a: @flatfile/plugin-delimiter-extractor can now guess the delimiter if one is not provided. Also the header detection logic has been upgraded.
  @flatfile/plugin-xlsx-extractor has updated header detection logic.

  ```

  ```

## 0.8.0

### Minor Changes

- 30981b2: Dependency updates

### Patch Changes

- Updated dependencies [30981b2]
  - @flatfile/util-extractor@0.5.0

## 0.7.10

### Patch Changes

- 7a0073d: Dependency cleanup
- Updated dependencies [7a0073d]
  - @flatfile/util-extractor@0.4.10

## 0.7.9

### Patch Changes

- Updated dependencies [c39cc51]
  - @flatfile/util-extractor@0.4.9

## 0.7.8

### Patch Changes

- Updated dependencies [c93b2d9]
  - @flatfile/util-extractor@0.4.8

## 0.7.7

### Patch Changes

- 28820d5: Release to update @flatfile/api dep
- Updated dependencies [28820d5]
- Updated dependencies [edaedf5]
  - @flatfile/util-extractor@0.4.7

## 0.7.6

### Patch Changes

- 59cb901: Export parsers

## 0.7.5

### Patch Changes

- cb25574: Update @flatfile/api dependency
- Updated dependencies [cb25574]
  - @flatfile/util-extractor@0.4.6

## 0.7.4

### Patch Changes

- Updated dependencies [f5cfe69]
  - @flatfile/util-extractor@0.4.5

## 0.7.3

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version
- Updated dependencies [f2b2f59]
  - @flatfile/util-extractor@0.4.4

## 0.7.2

### Patch Changes

- Updated dependencies [0195166]
  - @flatfile/util-extractor@0.4.3

## 0.7.1

### Patch Changes

- Updated dependencies [134cf31]
  - @flatfile/util-extractor@0.4.2

## 0.7.0

### Minor Changes

- cbf391e: Deprecate PSV/TSV extractors since PSV/TSV files are now natively supported by the Flatfile Platform.

## 0.6.1

### Patch Changes

- Updated dependencies [7019e58]
  - @flatfile/util-extractor@0.4.1

## 0.6.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/util-extractor@0.4.0

## 0.5.0

### Minor Changes

- 447691a: Add configurable batch options

### Patch Changes

- Updated dependencies [447691a]
  - @flatfile/util-extractor@0.3.0

## 0.4.3

### Patch Changes

- @flatfile/util-extractor@0.2.4

## 0.4.2

### Patch Changes

- f5efd60: Update @flatfile/listener dependency
- Updated dependencies [f5efd60]
  - @flatfile/util-extractor@0.2.3

## 0.4.1

### Patch Changes

- @flatfile/util-extractor@0.2.2

## 0.4.0

### Minor Changes

- c0b8d8d: Support duplicate headers with non-unique header keys

## 0.3.0

### Minor Changes

- 1cd2f31: Add header row auto-detection

### Patch Changes

- Updated dependencies [c859a10]
  - @flatfile/util-extractor@0.2.1

## 0.2.0

### Minor Changes

- 77b9237: Add backwards compatibility for renamed extractors

## 0.1.0

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor and use custom parsers. Add .tsv file extractor and a generic delimiter extractor. Add header row detection to the Excel extractor.

### Patch Changes

- Updated dependencies [2b15b32]
  - @flatfile/util-extractor@0.2.0
