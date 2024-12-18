<!-- START_INFOCARD -->

The `@flatfile/plugin-convert-yaml-schema` plugin converts YAML schema to
Flatfile Blueprint, a powerful DDL (Data Definition Language) created 
by Flatfile with a focus on validation and data preparation.

**Event Type:**
`listener.on('space:configure')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

#### `models` - `ModelToSheetConfig[]` - (required)
The `models` parameter holds the YAML Schema `sourceUrl` and take other Sheet configuration options.


#### `options.workbookConfig` - `PartialWorkbookConfig`
The `options.workbookConfig` parameter takes other optional Workbook configurations.


#### `options.debug` - `boolean`
The `options.debug` parameter lets you toggle on/off helpful debugging messages for development purposes.


#### `callback` - `function`
The `callback` parameter receives three arguments: `event`, `workbookIds`, and
a `tick` function. The `tick` function can be used to update the Job's
progress. The `callback` function is invoked once the Space and Workbooks are
fully configured.




## Basic Example

#### `listener.js`

```js listener.js
listener.use(
  configureSpaceWithYamlSchema([{ sourceUrl: "http://localhost:3000/yaml" }])
);
```



## Advanced Example

#### `listener.js`

```js listener.js
import api, { Flatfile } from "@flatfile/api";
import type { FlatfileEvent, FlatfileListener } from "@flatfile/listener";
import {
  ModelToSheetConfig,
  PartialWorkbookConfig,
  configureSpaceWithYamlSchema,
} from "@flatfile/plugin-convert-yaml-schema";

export default function (listener: FlatfileListener) {
  const workbookActions: Flatfile.Action[] = [
    {
      operation: "submitActionFg",
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

  const callback = async (
    event: FlatfileEvent,
    workbookIds: string[],
    tick: FlatfileTickFunction
  ) => {
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
    configureSpaceWithYamlSchema(
      [
        {
          sourceUrl:
            "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/fetch-schemas/example-schemas/yaml/person.yml",
          name: "Custom Person Sheet Name",
          actions: sheetActions,
        },
        {
          sourceUrl:
            "https://raw.githubusercontent.com/FlatFilers/flatfile-docs-kitchen-sink/main/typescript/fetch-schemas/example-schemas/yaml/product.yml",
        },
      ] as ModelToSheetConfig[],
      {
        workbookConfig: {
          name: "Custom YAML Schema Workbook Name",
          actions: workbookActions,
        } as PartialWorkbookConfig,
        debug: true,
      },
      callback
    )
  );
}
```