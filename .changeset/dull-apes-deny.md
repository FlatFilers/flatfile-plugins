---
'@flatfile/plugin-view-mapped': patch
---

This release fixes a bug in the view-mapped plugin when multiple sheets have fields with the same key by limiting the view-mapped update to the sheet being mapped. Additionally, the view-mapped plugin now only runs when the `trackChanges` setting in the workbook is enabled to prevent a race condition where the view-mapped plugin runs before hooks have completed.
