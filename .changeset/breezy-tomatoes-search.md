---
'@flatfile/plugin-constraints': patch
'@flatfile/plugin-record-hook': patch
'@flatfile/plugin-autocast': patch
---

This release fixes the builds of plugins utilizing the recordHook package by including recordHook as an external. This also moves the listener dep to peerDependencies which are considered externals.
