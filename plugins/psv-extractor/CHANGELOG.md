# @flatfile/plugin-psv-extractor

## 1.6.1

### Patch Changes

- f2b2f59: @flatfile/api dependency updated to latest version

## 1.6.0

### Minor Changes

- cbf391e: Deprecate PSV/TSV extractors since PSV/TSV files are now natively supported by the Flatfile Platform.

## 1.5.0

### Minor Changes

- b399623: Refactor extractors to handle extraction on job:ready, add debug option, fix asyncBatching

### Patch Changes

- Updated dependencies [b399623]
  - @flatfile/plugin-delimiter-extractor@0.6.0

## 1.4.0

### Minor Changes

- 447691a: Add configurable batch options

### Patch Changes

- Updated dependencies [447691a]
  - @flatfile/plugin-delimiter-extractor@0.5.0

## 1.3.4

### Patch Changes

- Updated dependencies [c0b8d8d]
  - @flatfile/plugin-delimiter-extractor@0.4.0

## 1.3.3

### Patch Changes

- 2e7fce8: Remove unsupported parameter

## 1.3.2

### Patch Changes

- Updated dependencies [1cd2f31]
  - @flatfile/plugin-delimiter-extractor@0.3.0

## 1.3.1

### Patch Changes

- 4651120: Add @deprecated comment

## 1.3.0

### Minor Changes

- 77b9237: Add backwards compatibility for renamed extractors

### Patch Changes

- Updated dependencies [77b9237]
  - @flatfile/plugin-delimiter-extractor@0.2.0

## 1.2.0

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor and use custom parsers. Add .tsv file extractor and a generic delimiter extractor. Add header row detection to the Excel extractor.

### Patch Changes

- Updated dependencies [2b15b32]
  - @flatfile/plugin-delimiter-extractor@0.1.0

## 1.1.0

### Minor Changes

- e7e5134: DRYing abstract extractor code

### Patch Changes

- Updated dependencies [e7e5134]
  - @flatfile/plugin-extractor-utils@0.1.0

## 1.0.0

### Major Changes

- ee6551e: fixing empty columns

## 0.0.3

### Patch Changes

- e16b17f: fix to empty columns

## 0.0.2

### Patch Changes

- c4bf511: console log not error
- 809b95a: new extractor for psv file types and fix to xlsx-extractor
