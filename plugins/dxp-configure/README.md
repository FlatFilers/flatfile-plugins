# Flatfile DXP Configuration Shim

This plugin lets you easily attach your implementation of the class-based schema configuration library `@flatfile/configure` to `@flatfile/listener`.

## Attaching a DXP Workbook configuration

You can simply attach any existing workbook configuration you have to a listener and it'll automatically apply to your next space.

`listener.js`
```js
import { MyWorkbook } from './my-dxp-workbook.js'
import { dxpConfigure } from '@flatfile/plugin-dxp-configure'

export default (listener) => {
  listener.use(dxpConfigure(MyWorkbook))
}
```

`my-dxp-workbook.js`
```js 
import { Sheet, TextField, Workbook } from '@flatfile/configure'

export const MyWorkbook = new Workbook({
  name: 'My Workbook',
  namespace: 'test',
  sheets: {
    mySheet: new Sheet('Test', {
      name: TextField('Full Name'),
      email: TextField({
        name: 'Email Address',
        compute: (val) => {
          return val.toLowerCase()
        },
      }),
    }),
  },
})
```
