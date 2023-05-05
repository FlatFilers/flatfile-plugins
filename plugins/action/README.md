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

### 1. Create a listener

Set up a listener to configure Flatfile and respond to data events:

```ts
export default function (listener) {
  // Set up your listener configuration here
}
```

### 2. Define an action

Use the plugin to define an action on a sheet or workbook:

```ts
import { action } from '@flatfile/plugin-action'

export default function (listener) {
  listener.use(
    action(
      'sheet:contact',
      {
        slug: 'duplicateSheet',
        label: 'Duplicate current sheet',
        description: 'Make a copy of the current sheet in this workbook',
        primary: true,
      },
      (context, api) => {
        const { actionName, sheetSlug, sheetId, workbookId } = event.context
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
      }
    )
  )
}
```
