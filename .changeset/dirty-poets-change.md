---
'@flatfile/plugin-webhook-event-forwarder': patch
'@flatfile/plugin-foreign-db-extractor': patch
'@flatfile/plugin-convert-sql-ddl': patch
'@flatfile/plugin-connect-via-merge': patch
'@flatfile/util-response-rejection': patch
'@flatfile/plugin-export-workbook': patch
'@flatfile/plugin-space-configure': patch
'@flatfile/plugin-json-extractor': patch
'@flatfile/plugin-convert-openapi-schema': patch
'@flatfile/plugin-webhook-egress': patch
'@flatfile/plugin-xlsx-extractor': patch
'@flatfile/plugin-dxp-configure': patch
'@flatfile/plugin-pdf-extractor': patch
'@flatfile/plugin-psv-extractor': patch
'@flatfile/plugin-tsv-extractor': patch
'@flatfile/plugin-xml-extractor': patch
'@flatfile/plugin-zip-extractor': patch
'@flatfile/common-plugin-utils': patch
'@flatfile/plugin-constraints': patch
'@flatfile/plugin-job-handler': patch
'@flatfile/plugin-convert-json-schema': patch
'@flatfile/plugin-record-hook': patch
'@flatfile/plugin-convert-yaml-schema': patch
'@flatfile/util-fetch-schema': patch
'@flatfile/util-file-buffer': patch
'@flatfile/plugin-autocast': patch
'@flatfile/plugin-automap': patch
'@flatfile/util-extractor': patch
'@flatfile/plugin-dedupe': patch
'@flatfile/utils-testing': patch
'@flatfile/util-common': patch
'@flatfile/rollup-config': minor
---

This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.
