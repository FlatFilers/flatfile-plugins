---
'@flatfile/plugin-xlsx-extractor': patch
'@flatfile/util-extractor': patch
---

This release fixes several issues related to large Excel file extractions. Previously the SheetJS library would quietly fail when attempting to parse large files. This release turns SheetJS's logging and listens for the ERR_STRING_TOO_LONG which indicates the file is too large to parse. When this occurs, the plugin will now throw an error with a message indicating the file is too large.

Additionally, a bug was fixed where the extraction job was not being immediately acknowledged. This resulted in a message indicating that `no listener has been configured to respond to it`. This has been fixed and the extraction job will now be acknowledged immediately.

A new `dateNF` option has been added to the plugin. This option allows you to specify the date format that should be used when parsing dates from the Excel file.

Finally, the default record insertion chunk size has been decreased from 10,000 to 5,000 to reflect the new default chunk size in the Flatfile Platform.