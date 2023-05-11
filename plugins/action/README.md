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
    action('operationName', (event, api, jobId) => {
      // Define your operation here
    })
  )
}
```

## Syntax

```ts
action(
  operation: string,
  fn: (event: FlatfileEvent, api: FlatfileClient) => void
)
```

### `operation`

The name of this action's operation, as specified in the blueprint.

### `fn`

The function that you use to define the action's behavior. Receives two arguments to help you define your action:

#### `event`

Information about the event, including context about what workbook or sheet triggered it. See full event reference [here](https://reference.flatfile.com/docs/api/5c9bb67e0d6ae-get-an-event).

#### `api`

Use this to make calls to the [Flatfile API](https://reference.flatfile.com/docs/api/pgrqb7max440y-introduction) to fetch, update, or otherwise modify workbooks, sheets, records, etc.

#### `jobId`

The id of the job that this action is associated with. Use this to update the progress of the job in the UI.

## Example

In this example we set up a "duplicate sheet" action on the "contacts" sheet in our workbook:

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
          "label": "Duplicate sheet",
          "type": "string",
          "description": "Creates a copy of this sheet.",
          "operation": "duplicateSheet"
        }
      ]
    }
  ],
  ...
}
```

And then in the listener, we use the plugin to define our action. Note the use of `event` to get information about the job, sheet, and workbook, and the use of `api` to fetch data and post updates to the workbook.

```ts
import { action } from '@flatfile/plugin-action'

export default function (listener) {
  listener.use(
    action('duplicateSheet', (event, api, jobId) => {
      await api.jobs.update(jobId, {
        progress: 25,
      })

      // Get current sheet
      const { sheetId, workbookId } = event.context
      const sheetResponse = await api.sheets.get(sheetId)
      const sheetConfig = sheetResponse.data.config
      await api.jobs.update(jobId, {
        progress: 50,
      })

      // Get current workbook
      const workbookResponse = await api.workbooks.get(workbookId)
      const { name, spaceId, environmentId, sheets } = workbookResponse.data
      await api.jobs.update(jobId, {
        progress: 75,
      })

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
