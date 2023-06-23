# @flatfile/plugin-record-hook

This package exports a [function](src/record.hook.plugin.ts) named `recordHook` that sets up an event listener for the `commit:created` event. The purpose of this plugin is to provide a concise syntax for running custom logic on individual data records in a sheet.

## Installing Plugin

Install using `npm`:

`npm i @flatfile/plugin-record-hook`

or `yarn`:

`yarn add @flatfile/plugin-record-hook`

## Starter Code Example 

``` typescript
import { recordHook } from "@flatfile/plugin-record-hook";

export default function(listener) {
  listener.on("**", (event) => {
    console.log(`-> My event listener received an event: ${JSON.stringify(event)}`);
  });

  //...other listeners

  listener.use(
    recordHook("my-sheet", (record, event) => {
      // Your logic goes here
    })
  );
}
```

You can read more [here](https://flatfile.com/docs/plugins/transform/record-hook).
