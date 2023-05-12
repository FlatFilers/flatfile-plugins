# Flatfile Create Space plugin

This is a plugin for configuring spaces created via the Flatfile dashboard UI.

## Install & import

```bash
npm i @flatfile/plugin-create-space
```

```ts
import { createSpace, action } from '@flatfile/plugin-events'
```

## Usage

Pass `createSpace` to a Flatfile data listener and provide a function to run when a new space is created via the UI.

```ts
import { createSpace } from '@flatfile/plugin-create-space'
export default function (listener) {
  listener.use(
    createSpace(async (event, api, spaceId) => {
      // Set up your space
    })
  )
}
```

## Syntax

```ts
createSpace(fn: async (event, api, spaceId) => void)
```

### `fn`

A function that will run when a space is created from the UI. Receives three arguments to help you configure your space:

#### `event`

Object containing contextual information about the event, e.g. the environment in which the space was created.

#### `api`

Use this to make calls to the [Flatfile API](https://reference.flatfile.com/docs/api/pgrqb7max440y-introduction) to configure your space.

#### `spaceId`

The id of the space that was just created. This is helpful when making API calls to configure your space.

## Example

```ts
export default function (listener) {
  listener.use(
    createSpace(async (event, api, spaceId) => {
      const { environmentId } = event.context

      // Create a workbook in this space
      const createWorkbook = await api.workbooks.create({
        spaceId,
        environmentId: environmentId,
        name: 'All Data',
        sheets: [
          {
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
              },
            ],
            actions: [
              {
                slug: 'submitAction',
                label: 'Submit',
                type: 'string',
                description: 'Submit data to webhook.site',
                primary: true,
              },
            ],
          },
        ],
      })

      // Create a document in this space
      const createDoc = await api.documents.create(spaceId, {
        title: 'Getting Started',
        body:
          '# Welcome\n' +
          '### Say hello to your first customer Space in the new Flatfile!\n' +
          "Let's begin by first getting acquainted with what you're seeing in your Space initially.\n" +
          '---\n',
      })
    })
  )
}
```
