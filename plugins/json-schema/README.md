<!-- START_INFOCARD -->

The @flatfile/plugin-convert-json-schema plugin will automatically convert JSON Schema to the Flatfile Blueprint, a powerful DDL (Data Definition Language) created by Flatfile with a focus on validation and data preparation, and configure a Flatfile Space using the Blueprint.

**Event Type:**
`listener.on('space:configure')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)

## Parameters

#### `setupFactory` - `JsonSetupFactory` - (required)
The `setupFactory` parameter holds the Workbook and Sheet configuration options and JSON Schema source.


#### `callback` - `function`
The `callback` parameter receives three arguments: `event`, `workbookIds`, and a `tick` function. The `tick` function can be used to update the Job's progress. The `callback` function is invoked once the Space and Workbooks are fully configured.



## API Calls

- `api.spaces.update`
- `api.workbooks.create`


## Usage

The @flatfile/plugin-convert-json-schema plugin simplifies the setup of new Flatfile Spaces by configuring the Space from a provided JSON Schema.
Designed for server-side listeners, it auto-configures the Space using the supplied settings.


```bash install
npm i @flatfile/plugin-convert-json-schema
```


```js import
import { configureSpaceWithJsonSchema } from "@flatfile/plugin-convert-json-schema";
```

### Source Example 1 - `listener.js`

```js listener.js - source example 1
// Pass a URL to `source` to retrieve the schema
listener.use(
  configureSpaceWithJsonSchema({
    workbooks: [
      {
        name: "JSON Schema Workbook",
        sheets: [
          {
            source:
              "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/dynamic-configurations-json-schema/example-schemas/person.json",
            name: "Custom Sheet Name - Person",
          },
        ],
      },
    ],
  })
);
```

### Source Example 2 - `listener.js`

```js listener.js - source example 2
// Pass a JSON object to `source` to use the schema directly
listener.use(
  configureSpaceWithJsonSchema({
    workbooks: [
      {
        source: {
          $id: "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/dynamic-configurations-json-schema/example-schemas/person.json",
          $schema: "https://json-schema.org/draft/2020-12/schema",
          title: "Person",
          type: "object",
          properties: {
            firstName: {
              type: "string",
              description: "The person's first name.",
            },
            lastName: {
              type: "string",
              description: "The person's last name.",
            },
            age: {
              description:
                "Age in years which must be equal to or greater than zero.",
              type: "integer",
              minimum: 0,
            },
          },
        },
      },
    ],
  })
);
```

### Source Example 3 - `listener.js`

```js listener.js - source example 3
// Pass a function to `source` retrieve the schema
listener.use(
  configureSpaceWithJsonSchema({
    workbooks: [
      {
        source: async () =>
          await fetchExternalReference(
            "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/dynamic-configurations-json-schema/example-schemas/person.json"
          ),
        name: "Custom Sheet Name - Person",
      },
    ],
  })
);
```



## Full Example - `listener.js`

```js listener.ts
import api, { Flatfile } from "@flatfile/api";
import type { FlatfileListener } from "@flatfile/listener";
import {
  PartialSheetConfig,
  PartialWorkbookConfig,
  configureSpaceWithJsonSchema,
  fetchExternalReference,
} from "@flatfile/plugin-convert-json-schema";

export default async function (listener: FlatfileListener) {
  const workbookActions: Flatfile.Action[] = [
    {
      operation: "submitAction",
      mode: "foreground",
      label: "Submit data",
      type: "string",
      description: "Submit this data to a webhook.",
      primary: true,
    },
  ];

  const sheetActions: Flatfile.Action[] = [
    {
      operation: "duplicateSheet",
      mode: "foreground",
      label: "Duplicate",
      description: "Duplicate this sheet.",
      primary: true,
    },
  ];

  const personModel: PartialSheetConfig = {
    source: {
      $id: "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/dynamic-configurations-json-schema/example-schemas/person.json",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      title: "Person",
      type: "object",
      properties: {
        firstName: {
          type: "string",
          description: "The person's first name.",
        },
        lastName: {
          type: "string",
          description: "The person's last name.",
        },
        age: {
          description:
            "Age in years which must be equal to or greater than zero.",
          type: "integer",
          minimum: 0,
        },
      },
    },
    slug: "person",
    name: "Person",
    actions: sheetActions,
  };

  const customerModel: PartialSheetConfig = {
    source:
      "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/dynamic-configurations-json-schema/example-schemas/customer.json",
    slug: "customer",
    name: "Customer",
    actions: sheetActions,
  };

  const productModel: PartialSheetConfig = {
    source: async () =>
      await fetchExternalReference(
        "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/dynamic-configurations-json-schema/example-schemas/product.json"
      ),
    slug: "product",
    name: "Product",
    actions: sheetActions,
  };

  const workbookOne: PartialWorkbookConfig = {
    name: "Store Workbook",
    sheets: [customerModel, productModel],
    actions: workbookActions,
  };

  const workbookTwo: PartialWorkbookConfig = {
    name: "Person Workbook",
    sheets: [personModel],
    actions: workbookActions,
  };

  const callback = async (event, workbookIds, tick) => {
    const { spaceId } = event.context;
    await api.documents.create(spaceId, {
      title: "Welcome",
      body: `<div>
      <h1>Welcome!</h1>
      <h2>To get started, follow these steps:</h2>
      <h2>1. Step One</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      <h3>Remember, if you need any assistance, you can always refer back to this page by clicking "Welcome" in the left-hand sidebar!</h3>
      </div>`,
    });
    await tick(80, "Document created");
  };

  listener.use(
    configureSpaceWithJsonSchema(
      {
        workbooks: [workbookOne, workbookTwo],
      },
      callback
    )
  );
}
```