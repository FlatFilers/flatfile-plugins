# @flatfile/plugin-connect-via-merge

This is an **alpha release** connect plugin for Merge.dev. Using this plugin will enable you to sync data from hundreds of integrations (connected through Merge.dev) with Flatfile.

## Before you begin...

1. Email support@flatfile.com to request that the `connections` flag be enabled for your account.
2. Create a [Merge.dev](https://www.merge.dev) account.
4. Create and configure a [Flatfile Space](https://platform.flatfile.com).
3. Create a new secret named `MERGE_ACCESS_KEY` in your space containing your [Merge.dev API key](https://app.merge.dev/keys).

## Getting started

First, install the plugin:
```bash
npm i @flatfile/plugin-connect-via-merge
```

Now you can create your Flatfile listener:

Javascript:
```js
import mergePlugin from "@flatfile/plugin-connect-via-merge";

export default function (listener) {
  listener.use(mergePlugin());
}
```

Typescript:
```ts
import type { FlatfileListener } from "@flatfile/listener";
import mergePlugin from "@flatfile/plugin-connect-via-merge";

export default function (listener: FlatfileListener) {
  listener.use(mergePlugin());
}
```

And finally, deploy it to Flatfile:
  
```bash
npx flatfile@latest deploy
```

With the `connections` feature flag enabled, you will see a new item in your space's sidebar labeled "Add Connection". Clicking this will open a modal where you can select the Merge.dev integration you want to connect to Flatfile. After you've made your selection, Merge.dev will since your selected integration with their system and your Flatfile listener will create a Workbook with Sheets to match Merge.dev's schema. Once the Merge.dev sync is complete, your Flatfile listener will complete the process by syncing with Merge.dev.