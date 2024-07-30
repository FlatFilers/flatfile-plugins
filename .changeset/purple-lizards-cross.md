---
'@flatfile/utils-testing': minor
---

Fixed bug where `waitFor` promise was being fulfilled immediately. Changed `invocations` to store a log of FlatfileEvents and `invocationWatchers` to be compatible with the existing `matchEvent` method on Flatfile Listeners. Also exposed `invocationWatchers` to the public API.
