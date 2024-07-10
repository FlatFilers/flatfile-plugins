---
'@flatfile/plugin-delimiter-extractor': major
'@flatfile/plugin-xlsx-extractor': major
'@flatfile/util-extractor': major
---

Removed the 'Required' field check from extractors and the subsequent field.constraints.required. 
This is a breaking change if you are using this required field check in your implementation.

Source sheets don't require the field.constraints.required.

If you need to implement this functionality you can use a listener to add in the field.constraints.required to the specific fields you need.