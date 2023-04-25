# Flatfile Record Hook Plugin

This plugin provides a concise syntax for running custom logic on individual data records in Flatfile.

## Install & import

```bash
npm i @flatfile/plugin-record-hook @flatfile/hooks
```

```ts
import { recordHook } from '@flatfile/plugin-record-hook'
import type { FlatfileRecord } from '@flatfile/hooks'
```

## Usage

Pass `recordHook` to a Flatfile data listener and provide a function to run when data is added or updated.

### 1. Create a listener

Set up a listener to configure Flatfile and respond to data events:

```ts
import {
  Client,
  FlatfileVirtualMachine,
  FlatfileEvent,
} from '@flatfile/listener'

const listener = Client.create((client) => {
  // Set up your configuration here
})

const FlatfileVM = new FlatfileVirtualMachine()

listener.mount(FlatfileVM)

export default listener
```

### 2. Listen for data changes

Use the this plugin to set up a hook that responds to data changes:

```ts
import { recordHook } from '@flatfile/plugin-record-hook'

listener.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    // Your logic goes here
  })
)
```

Replace `my-sheet` with the slug of the Sheet you want to attach this hook to.

## Example usage

Create a record hook that populates a "full name" field based on the values of first name and last name:

```ts
listener.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    const firstName = record.get('firstName')
    const lastName = record.get('lastName')
    if (firstName && lastName && !record.get('fullName')) {
      record.set('fullName', `${firstName} ${lastName}`)
      record.addComment(
        'fullName',
        'Full name was populated from first and last name.'
      )
    }
    return record
  })
)
```

## Related plugins

Use helper functions from [@flatfile/plugin-transform](https://www.npmjs.com/package/@flatfile/plugin-transform) in your record hooks for cleaner syntax.
