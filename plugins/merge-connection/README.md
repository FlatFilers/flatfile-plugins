# @flatfile/plugin-connect-via-merge

This is a connect plugin for Merge.dev. Using this plugin will enable you to sync data from hundreds of integrations (connected through Merge.dev) with Flatfile.

## Get Started

To use this plugin, you'll need to create a [Merge.dev](https://www.merge.dev) account. Then create a new [Flatfile secret](https://platform.flatfile.com) (either an environment secret or space secret) named `MERGE_ACCESS_KEY` containing your [Merge.dev API key](https://app.merge.dev/keys).

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