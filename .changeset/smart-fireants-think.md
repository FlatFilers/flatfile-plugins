---
'@flatfile/plugin-dedupe': major
'@flatfile/plugin-job-handler': minor
'@flatfile/util-common': patch
---

`@flatfile/plugin-dedupe`: This release improves dedupe's handling of records. Previously it only deduped the first 10k records. Now it dedupes the entire sheet. It takes advantage of the `processRecords` utility for retrieving and finding duplicates, and creates a bulk record deletion job. Additionally it improves error messaging and bundles for both NodeJS and the browser.

`@flatfile/plugin-job-handler`: This release updates `jobHandler`'s job parameter to allow passing an `EventFilter`.

`@flatfile/util-common`: This release fixes cross compatibility issues by using `@flatfile/cross-env-config` to retrieve environment variables.