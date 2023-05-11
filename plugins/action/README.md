# Flatfile Action Plugin

This plugin provides a concise syntax for defining custom actions users can take in Flatfile.

## Install & import

```bash
npm i @flatfile/plugin-action
```

```ts
import { action } from '@flatfile/plugin-action'
```

## Usage

Pass `action` to a Flatfile data listener and provide a function to run when the action is triggered by a user.

### 1. Create an action on a workbook or sheet

Follow [this guide](https://flatfile.com/docs/guides/custom-actions) to create an action on a workbook or sheet.

### 2. Define the operation

Use the plugin in your listener to define what should happen when this action is triggered:

```ts
import { action } from '@flatfile/plugin-action'

export default function (listener) {
  listener.use(
    action('sheetOrWorkbookSlug', 'actionName', (event, api) => {
      // Define your operation here
    })
  )
}
```

## Syntax

```ts
action(
  origin: string,
  name: string,
  operation: (event: FlatfileEvent, api: FlatfileClient) => void
)
```

### `origin`

The slug of the sheet or workbook that this action is attached to.

### `name`

The slug of the action you are defining.

### `operation`

The function that you use to define the action's behavior. Receives two arguments to help you define your action:

#### `event`

Information about the event, including context about what workbook or sheet triggered it. See full event reference [here](https://reference.flatfile.com/docs/api/5c9bb67e0d6ae-get-an-event).

#### `api`

Use this to make calls to the [Flatfile API](https://reference.flatfile.com/docs/api/pgrqb7max440y-introduction) to fetch, update, or otherwise modify workbooks, sheets, records, etc.

## Example

In this example we set up a "duplicate sheet" action on the "contacts" sheet in our workbook.

Blueprint:

```json
{
  "name": "Employees workbook",
  "sheets": [
    {
      "name": "Contacts sheet",
      "slug": "contacts",
      "fields": [ ... ],
      "actions": [
        {
          "slug": "duplicateSheet",
          "label": "Duplicate this sheet",
          "type": "string",
          "description": "Creates a copy of this sheet."
        }
      ]
    }
  ],
  ...
}
```

Listener:

```ts
import { action } from '@flatfile/plugin-action'

export default function (listener) {
  listener.use(
    action('contacts', 'duplicateSheet', (event, api) => {
      const { sheetId, workbookId } = event.context
      const sheetResponse = await api.sheets.get(sheetId)
      const sheetConfig = sheetResponse.data.config

      // Get current workbook
      const workbookResponse = await api.workbooks.get(workbookId)
      const { name, spaceId, environmentId, sheets } = workbookResponse.data

      // Create a copy of the current sheet
      const duplicateSheetConfig = {
        ...sheetConfig,
        name: `${sheetConfig.name} copy`,
        slug: `${sheetConfig.slug} copy`,
      }

      // Push the sheet onto this workbook's sheets list
      const newSheets = []
      sheets.forEach((sheet) => {
        newSheets.push(sheet.config)
      })
      newSheets.push(duplicateSheetConfig)

      // Update the workbook
      await api.workbooks.update(workbookId, {
        name,
        spaceId,
        environmentId,
        sheets: newSheets,
      })
    })
  )
}
```
