<!-- START_INFOCARD -->

The @flatfile/plugin-space-reconfigure plugin streamlines the reconfiguration of an existing Flatfile Space.

**Event Type:**
`listener.on('space:reconfigure')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)


## Parameters

#### `setup` - `SetupFactory` - (required)

The `setup` parameter holds the configuration settings for updating the existing Space. Workbooks are matched by name or slug and updated accordingly. New workbooks are created for unmatched configurations.


#### `callback` - `function`

The `callback` parameter receives three arguments: `event`, `workbookIds`, and a `tick` function. The `tick` function can be used to update the Job's progress. The `callback` function is invoked once the Space and Workbooks are fully reconfigured.


## API Calls

- `api.workbooks.list`
- `api.workbooks.update`
- `api.workbooks.create`
- `api.spaces.update`
- `api.documents.create`


## How It Works

1. **Fetch Existing Workbooks**: Retrieves all workbooks currently in the space
2. **Match Workbooks**: Matches provided workbook configurations to existing workbooks by name or slug
3. **Update Existing**: Updates matched workbooks with new configurations
4. **Create New**: Creates new workbooks for unmatched configurations
5. **Update Space**: Updates space settings and maintains workbook order if configured


## Usage

The @flatfile/plugin-space-reconfigure plugin simplifies the reconfiguration of existing Flatfile Spaces.

Designed for server-side listeners, it auto-reconfigures the Space using the supplied settings.

#### Install

```bash install
npm i @flatfile/plugin-space-reconfigure
```

#### Import

```js import
import { reconfigureSpace } from "@flatfile/plugin-space-reconfigure";
```

#### `listener.js` with workbook updates

```js listener.js
listener.use(
  reconfigureSpace({
    workbooks: [
      {
        name: "Getting Started", // This will update existing workbook with this name
        sheets: [
          {
            name: "Updated Contacts",
            slug: "contacts",
            fields: [
              {
                key: "name",
                type: "string",
                label: "Full Name", // Updated label
              },
              {
                key: "email",
                type: "string",
                label: "Email Address",
              },
              {
                key: "phone", // New field
                type: "string",
                label: "Phone Number",
              },
            ],
          },
        ],
      },
    ],
  })
);
```

#### `listener.js` with new workbook creation

```js listener.js
listener.use(
  reconfigureSpace({
    workbooks: [
      {
        name: "New Analytics Workbook", // This will create a new workbook
        sheets: [
          {
            name: "Metrics",
            slug: "metrics",
            fields: [
              {
                key: "metric",
                type: "string",
                label: "Metric Name",
              },
              {
                key: "value",
                type: "number",
                label: "Value",
              },
            ],
          },
        ],
      },
    ],
  })
);
```


## Full Example

#### `listener.ts`

```typescript listener.ts
import api from "@flatfile/api";
import type { FlatfileListener } from "@flatfile/listener";
import { reconfigureSpace } from "@flatfile/plugin-space-reconfigure";

export default function (listener: FlatfileListener) {
  listener.use(
    reconfigureSpace(
      {
        workbooks: [
          {
            name: "Updated Contacts Workbook", // Will update existing or create new
            sheets: [
              {
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
                  {
                    key: "phone", // New field added during reconfiguration
                    type: "string",
                    label: "Phone Number",
                  },
                ],
                actions: [
                  {
                    operation: "validateData",
                    mode: "background",
                    label: "Validate Data",
                    description: "Validate contact information",
                  },
                ],
              },
            ],
            actions: [
              {
                operation: "submitActionFg",
                mode: "foreground",
                label: "Submit Updated Data",
                type: "string",
                description: "Submit reconfigured data to webhook.",
                primary: true,
              },
            ],
          },
        ],
        space: {
          metadata: {
            theme: {
              root: {
                primaryColor: "blue", // Updated theme
              },
            },
          },
        },
        config: {
          maintainWorkbookOrder: true,
        },
      },
      async (event, workbookIds, tick) => {
        const { spaceId } = event.context;
        // Callback is invoked once the Space and Workbooks are fully reconfigured.
        tick(85, "Running reconfiguration callback!");

        // Perform any additional setup after reconfiguration
        console.log(`Reconfigured space ${spaceId} with workbooks: ${workbookIds.join(', ')}`);

        await tick(99, "Reconfiguration complete!");
      }
    )
  );
}
```

## Workbook Matching Logic

The plugin uses the following logic to match workbook configurations to existing workbooks:

1. **Primary Match**: Matches by `name` field
2. **Secondary Match**: If no name match, tries to match by `slug` field
3. **Fallback**: If no match found, creates a new workbook

This ensures that existing workbooks are updated when possible, while still allowing for new workbooks to be created as needed.
