---
'@flatfile/plugin-xlsx-extractor': major
---

- Added merged cell handling options to control how merged cells are processed during extraction
- Added support for different treatments based on merge type (across columns, rows, or ranges)
- Added options to apply values to all cells, top-left cell only, coalesce, or concatenate values
- Added cascadeRowValues option to automatically cascade values down the dataset until a blank row, new value, or end of dataset
- Added cascadeHeaderValues option to automatically cascade values across header rows until a blank column, new value, or end of dataset
- These features improve handling of hierarchical data and multi-level headers in Excel files