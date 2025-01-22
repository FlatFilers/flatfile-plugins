<!-- START_INFOCARD -->

The `@flatfile/plugin-space-configure-from-template` plugin streamlines the setup of a new Flatfile Space from a Space Template.

**Event Type:**
`listener.on('space:configure')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)


## Parameters

#### `callback` - `function`

The `callback` parameter receives three arguments: `event`, `workbookIds`, and a `tick` function. The `tick` function can be used to update the Job's progress. The `callback` function is invoked once the Space and Workbooks are fully configured.


## API Calls

- `api.spaces.update`
- `api.workbooks.create`
- `api.documents.create`



## Usage

The `@flatfile/plugin-space-configure-from-template` plugin simplifies the setup of a new Flatfile Space from a Space Template.

Designed for server-side listeners, it auto-configures the Space using the supplied settings.

#### Install

```bash install
npm i @flatfile/plugin-space-configure-from-template
```

#### Example

#### `listener.ts`

```typescript listener.ts
import { configureSpaceFromTemplate } from "@flatfile/plugin-space-configure-from-template";

export default function (listener: FlatfileListener) {
  listener.use(configureSpaceFromTemplate());
}
```


## Example with Callback

#### `listener.ts`

```typescript listener.ts
import api from "@flatfile/api";
import type { FlatfileListener } from "@flatfile/listener";
import { configureSpaceFromTemplate } from "@flatfile/plugin-space-configure-from-template";
import { contactsSheet } from "./contactsSheet";
import { companiesSheet } from "./companiesSheet";

export default function (listener: FlatfileListener) {
  listener.use(
    configureSpaceFromTemplate(
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
