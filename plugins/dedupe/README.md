<!-- START_INFOCARD -->

This plugin dedupes records in a Sheet via a Sheet-level action.

**Event Type:**
`listener.on('job:ready')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/orchestration/listeners#listener-types)


## Parameters

#### `jobOperation` - `string` - (required)

The `jobOperation` parameter specifies the name of the job operation to match on.

#### `opt.on` - `string`

The `on` parameter specifies which field key to match on.

#### `opt.keep` - `'first' | 'last'`

The `keep` option lets you choose whether to keep the first or last duplicate record.

#### `opt.custom` - `function()`

The `custom` parameter accepts a custom dedupe function. This will override the `keep` parameter.

#### `opt.debug` - `boolean`

The `debug` parameter lets you toggle on/off helpful debugging messages for development purposes.


## API Calls

- `api.records.get`
- `api.jobs.ack`
- `api.records.delete`
- `api.jobs.fail`
- `api.jobs.complete`


## Usage

An action with the operation name of "dedupe-email" must be configured on a Sheet for the plugin to be triggered.

```bash install
npm i @flatfile/plugin-dedupe
```

```js import
import { dedupePlugin } from "@flatfile/plugin-dedupe";
```

```ts contactsSheet.ts
import { Flatfile } from '@flatfile/api'

export const contactsSheet: Flatfile.SheetConfig = {
  name: 'Contacts',
  slug: 'contacts',
  fields: [
    {
      key: 'firstName',
      type: 'string',
      label: 'First Name',
    },
    {
      key: 'lastName',
      type: 'string',
      label: 'Last Name',
    },
    {
      key: 'email',
      type: 'string',
      label: 'Email',
    }
  ],
  // Add a Sheet-level action here for the dedupe plugin
  actions: [
    {
      operation: "dedupe-email",
      mode: "background",
      label: "Dedupe emails",
      description: "Remove duplicate emails"
    }
  ]
}
```

### JavaScript

#### listener.js 

```js listener.js
// common usage
// Keep the last record encountered (from top to bottom) based on the`email` field key.
// Must have a Sheet-level action specified with the operation name `dedupe-email`
listener.use(
  dedupePlugin("dedupe-email", {
    on: "email",
    keep: "last",
  })
);

// user specified dedupe function must return a list a record id's for deletion
listener.use(
  dedupePlugin("dedupe-email", {
    custom: (records) => {
      let uniques = new Set();
      let toDelete = [];

      records.forEach(record => {
        const { value } = record.values["email"];
        if (uniques.has(value)) {
          toDelete.push(record.id);
        } else {
          uniques.add(value);
        }
      });

      return toDelete;
    },
  })
);
```

### TypeScript

#### listener.ts 

```ts listener.ts
// common usage
// Keep the last record encountered (from top to bottom) based on the`email` field key.
// Must have a Sheet-level action specified with the operation name `dedupe-email`
listener.use(
  dedupePlugin("dedupe-email", {
    on: "email",
    keep: "last",
  })
);

// user specified dedupe function must return a list a record id's for deletion
listener.use(
  dedupePlugin("dedupe-email", {
    custom: (records: Flatfile.RecordsWithLinks) => {
      let uniques = new Set();
      let toDelete = [];

      records.forEach(record => {
        const { value } = record.values["email"];
        if (uniques.has(value)) {
          toDelete.push(record.id);
        } else {
          uniques.add(value);
        }
      });

      return toDelete;
    },
  })
);
```
