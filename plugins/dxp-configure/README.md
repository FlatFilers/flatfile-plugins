<!-- START_INFOCARD -->

The `@flatfile/plugin-dxp-configure` plugin lets you easily attach your implementation of the class-based schema configuration library `@flatfile/configure` to `@flatfile/listener`.

<!-- END_INFOCARD -->

> If you're upgrading from Portal 3, check out the [Upgrade Guide](/docs/upgrade/v3_dxp_configure).

## Parameters

#### `workbook` - `Workbook`

The `workbook` parameter takes a Flatfile Workbook.


## Usage

You can simply attach any existing workbook configuration you have to a listener, and it'll automatically apply to your next Space.

### Install

```bash install
npm i @flatfile/plugin-dxp-configure
```

### Import

```js import
import { dxpConfigure } from "@flatfile/plugin-dxp-configure";
```


### `listener.js`

```js listener.js
import { MyWorkbook } from './my-dxp-workbook.js'
import { dxpConfigure } from '@flatfile/plugin-dxp-configure'

export default (listener) => {
  listener.use(dxpConfigure(MyWorkbook))
}
```

### `listener.ts`

```js listener.ts
import { MyWorkbook } from "./my-dxp-workbook.js";
import { dxpConfigure } from "@flatfile/plugin-dxp-configure";
import { FlatfileListener } from "@flatfile/listener";

export default (listener: FlatfileListener) => {
  listener.use(dxpConfigure(MyWorkbook));
};
```

### `my-dxp-workbook.js`

```js my-dxp-workbook.js
import { Sheet, TextField, Workbook } from "@flatfile/configure";

export const MyWorkbook = new Workbook({
  name: "My Workbook",
  namespace: "test",
  sheets: {
    mySheet: new Sheet("Test", {
      name: TextField("Full Name"),
      email: TextField({
        label: "Email Address",
        compute: (val) => {
          return val.toLowerCase();
        },
      }),
    }),
  },
});
```
