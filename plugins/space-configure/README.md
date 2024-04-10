<!-- START_INFOCARD -->

The @flatfile/plugin-space-configure plugin streamlines the setup of a new Flatfile Space.

**Event Type:**
`listener.on('space:configure')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)


## Parameters

### `setup` *SetupFactory* (required)

The `setup` parameter holds the configuration settings for the new Space.


### `callback` *function*

The `callback` parameter receives three arguments: `event`, `workbookIds`, and a `tick` function. The `tick` function can be used to update the Job's progress. The `callback` function is invoked once the Space and Workbooks are fully configured.


## API Calls

- `api.spaces.update`
- `api.workbooks.create`



## Usage

The @flatfile/plugin-space-configure plugin simplifies the setup of new Flatfile Spaces.

Designed for server-side listeners, it auto-configures the Space using the supplied settings.

### Install

```bash install
npm i @flatfile/plugin-space-configure
```

### Import

```js import
import { configureSpace } from "@flatfile/plugin-space-configure";
```

### `listener.js` with no workbooks

```js listener.js w/ no workbooks
listener.use(
  configureSpace({
    workbooks: [],
  })
);
```

### `listener.js` with workbooks

```js listener.js /w workbooks
listener.use(
  configureSpace({
    workbooks: [
      {
        name: "Getting Started",
        sheets: [
          {
            name: "Contacts",
            slug: "contacts",
            fields: [
              {
                key: "name",
                type: "string",
                label: "Name",
              },
              {
                key: "email",
                type: "string",
                label: "Email",
              },
            ],
          },
        ],
        actions: [
          {
            operation: "submitActionFg",
            mode: "foreground",
            label: "Submit data",
            type: "string",
            description: "Submit this data to ...",
            primary: true,
          },
        ],
      },
    ],
  })
);
```


## Full Example

### `contactsSheet.ts`

```typescript contactsSheet.ts
import { Flatfile } from "@flatfile/api";

export const contactsSheet: Flatfile.SheetConfig = {
  name: "Contacts",
  slug: "contacts",
  fields: [
    {
      key: "firstName",
      type: "string",
      label: "First Name",
    },
    {
      key: "lastName",
      type: "string",
      label: "Last Name",
    },
    {
      key: "email",
      type: "string",
      label: "Email",
    },
    {
      key: "company",
      type: "reference",
      label: "Company",
      config: {
        key: "email",
        ref: "companies",
        relationship: "has-one",
      },
    },
  ],
  actions: [
    {
      operation: "duplicateSheet",
      mode: "foreground",
      label: "Duplicate",
      description: "Duplicate this sheet.",
      primary: true,
    },
    {
      operation: "dedupeEmail",
      mode: "background",
      label: "Dedupe emails",
      description: "Remove duplicate emails",
    },
  ],
};
```

### `companiesSheet.ts`

```typescript companiesSheet.ts
import { Flatfile } from "@flatfile/api";

export const companiesSheet: Flatfile.SheetConfig = {
  name: "Companies",
  slug: "companies",
  fields: [
    {
      key: "name",
      type: "string",
      label: "Name",
    },
    {
      key: "website",
      type: "string",
      label: "Website",
    },
    //...
  ],
};
```

### `listener.ts`

```typescript listener.ts
import api from "@flatfile/api";
import type { FlatfileListener } from "@flatfile/listener";
import { configureSpace } from "@flatfile/plugin-space-configure";
import { contactsSheet } from "./contactsSheet";
import { companiesSheet } from "./companiesSheet";

export default function (listener: FlatfileListener) {
  listener.use(
    configureSpace(
      {
        workbooks: [
          {
            name: "Workbook 1",
            sheets: [contactsSheet, companiesSheet],
            actions: [
              {
                operation: "submitActionFg",
                mode: "foreground",
                label: "Submit data",
                type: "string",
                description: "Submit this data to a webhook.",
                primary: true,
              },
              {
                operation: "duplicateWorkbook",
                mode: "foreground",
                label: "Duplicate",
                description: "Duplicate this workbook.",
              },
            ],
          },
        ],
        space: {
          metadata: {
            theme: {
              root: {
                primaryColor: "black",
              },
              sidebar: {
                logo: "https://images.ctfassets.net/hjneo4qi4goj/33l3kWmPd9vgl1WH3m9Jsq/13861635730a1b8af383a8be8932f1d6/flatfile-black.svg",
              },
            },
          },
        },
        documents: [
          {
            title: "Welcome",
            body: `<div>
          <h1 style="margin-bottom: 36px;">Welcome!</h1>
          <h2 style="margin-top: 0px; margin-bottom: 12px;">To get started, follow these steps:</h2>
          <h2 style="margin-bottom: 0px;">1. Step One</h2>
          <p style="margin-top: 0px; margin-bottom: 8px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          <h2 style="margin-bottom: 0px;">2. Step Two</h2>
          <p style="margin-top: 0px; margin-bottom: 8px;">Consectetur libero id faucibus nisl tincidunt eget. Pellentesque elit eget gravida cum sociis natoque penatibus et. Tempor orci eu lobortis elementum nibh.</p>
          </div>`,
          },
        ],
      },
      async (event, workbookIds, tick) => {
        const { spaceId } = event.context;
        // Callback is invoked once the Space and Workbooks are fully configured.
        // Job progress will be at 50% when the callback is invoked.
        tick(51, "Running callback!");

        // Do something...

        await tick(99, "Callback complete!");
      }
    )
  );
}
```
