---
'@flatfile/plugin-foreign-db-extractor': patch
'@flatfile/plugin-connect-via-merge': patch
'@flatfile/util-response-rejection': patch
'@flatfile/plugin-space-configure': patch
'@flatfile/plugin-webhook-egress': patch
'@flatfile/plugin-constraints': patch
'@flatfile/plugin-job-handler': patch
'@flatfile/plugin-record-hook': patch
'@flatfile/plugin-autocast': patch
'@flatfile/plugin-dedupe': patch
'@flatfile/util-common': patch
---

`@flatfile/plugin-connect-via-merge`: `@flatfile/api@1.7.10` removes `countRecords` from the get sheet endpoint. This release switches to the get record count endpoint.

This release also includes bundling fixes across the Flatfile plugin ecosystem.
