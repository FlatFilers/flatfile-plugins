---
'@flatfile/util-common': major
'@flatfile/util-response-rejection': patch
---

@flatfile/util-common: This release provides additional record request options such as "filter" and passes the current pageNumber to the cb function. Additionally the cb will be called when no records are found for any wrap-up the cb needs to make.

@flatfile/util-response-rejection: Since @flatfile/util-common now calls the cb when no records are found, this release updates @flatfile/util-response-rejection to check for records before processing.
```
