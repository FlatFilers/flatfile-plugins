---
'@flatfile/plugin-webhook-event-forwarder': minor
'@flatfile/plugin-foreign-db-extractor': minor
'@flatfile/plugin-delimiter-extractor': minor
'@flatfile/plugin-convert-sql-ddl': minor
'@flatfile/plugin-connect-via-merge': minor
'@flatfile/util-response-rejection': minor
'@flatfile/plugin-export-workbook': minor
'@flatfile/plugin-space-configure': minor
'@flatfile/plugin-graphql-schema': minor
'@flatfile/plugin-convert-openapi-schema': minor
'@flatfile/plugin-webhook-egress': minor
'@flatfile/plugin-dxp-configure': minor
'@flatfile/plugin-pdf-extractor': minor
'@flatfile/plugin-psv-extractor': minor
'@flatfile/plugin-tsv-extractor': minor
'@flatfile/plugin-zip-extractor': minor
'@flatfile/plugin-constraints': minor
'@flatfile/plugin-job-handler': minor
'@flatfile/plugin-convert-json-schema': minor
'@flatfile/plugin-convert-yaml-schema': minor
'@flatfile/util-fetch-schema': minor
'@flatfile/util-file-buffer': minor
'@flatfile/plugin-autocast': minor
'@flatfile/plugin-automap': minor
'@flatfile/util-extractor': minor
'@flatfile/plugin-dedupe': minor
'@flatfile/util-common': minor
---

This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.
