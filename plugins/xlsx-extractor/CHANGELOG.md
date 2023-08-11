# @flatfile/plugin-record-hook

## 1.5.0

### Minor Changes

- c0b8d8d: Support duplicate headers with non-unique header keys

## 1.4.0

### Minor Changes

- 6189d31: Fix for ghost rows in Excel files

## 1.3.2

### Patch Changes

- 1cd2f31: Add header row auto-detection
- Updated dependencies [c859a10]
  - @flatfile/util-extractor@0.2.1

## 1.3.1

### Patch Changes

- 4651120: Add @deprecated comment

## 1.3.0

### Minor Changes

- 77b9237: Add backwards compatibility for renamed extractors

## 1.2.0

### Minor Changes

- 2b15b32: Refactor extractors to share a common extractor and use custom parsers. Add .tsv file extractor and a generic delimiter extractor. Add header row detection to the Excel extractor.

### Patch Changes

- Updated dependencies [2b15b32]
  - @flatfile/util-extractor@0.2.0

## 1.1.0

### Minor Changes

- e7e5134: DRYing abstract extractor code

### Patch Changes

- Updated dependencies [e7e5134]
  - @flatfile/plugin-extractor-utils@0.1.0

## 1.0.8

### Patch Changes

- 3656390: Open up the event typing

## 1.0.7

### Patch Changes

- 02b9420: fixes issue with extracting export files

## 1.0.6

### Patch Changes

- c4bf511: console log not error
- 809b95a: new extractor for psv file types and fix to xlsx-extractor

## 1.0.4

### Patch Changes

- 749ebdc: introduce records chunking to xlsx extractor

## 1.0.3

### Patch Changes

- 7fa7925: updating readmes

## 1.0.2

### Patch Changes

- 413251a: Progress Improvements and adds xlsxExtractorPlugin

## 1.0.1

### Patch Changes

- 41261d0: Build tooling refactor

## 1.0.0

### Major Changes

- 7bbc5b4: Initial release of xlsx plugin

## 0.1.0

### Minor Changes

- a377336: Move RecordHook functionality into this package and remove configure dependency.

### Patch Changes

- 41e7f5a: upped the listener version

## 0.0.7

### Patch Changes

- cf6d07e: Fixes a bug where we don't return the promise so we can't wait for the event to complete

## 0.0.6

### Patch Changes

- 01b3e64: Introducing the DXP Configuration Plugin

## 0.0.5

### Patch Changes

- 8ed9bb3: Add four new plugin skeletons; add category metadata to existing

## 0.0.4

### Patch Changes

- ae45695: Update readmes and package info

## 0.0.3

### Patch Changes

- aaf6cc6: README updates

## 0.0.2

### Patch Changes

- 4ca7bb1: New transform plugin and improved documentation

## 0.0.1

### Patch Changes

- fbfaab9: Basic record hook plugin.
