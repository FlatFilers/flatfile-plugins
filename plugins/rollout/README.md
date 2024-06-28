<!-- START_INFOCARD -->

# @flatfile/plugin-rollout
**Automatically rollout schema changes to already live workbooks.**


This plugin listens for new agent deployments and automatically applies schema changes to already live workbooks. The plugin will update the schema of the workbook to match the latest schema of the sheet and trigger a rerun of hooks on all records in all sheets.

**Events Handled:**
- `commit:created`
- `agent:updated`
- `agent:created`


<!-- END_INFOCARD -->


## Parameters

#### `namespace` - `string`

Optionally only apply this updater to workbooks in certain namespaces.

#### `dev` - `boolean`

Also run the updater in local dev mode whenever the agent reloads (this can be problematic if you have many spaces in your dev environment).


#### `updater` - `cb: (workbooks: Flatfile.Workbook[]) => Flatfile.Workbook[]`

A callback to use to update the workbooks you want to migrate. This callback should return the updated workbooks so that data hooks can be run.

## API Calls

- `GET /api/v1/spaces`
- `GET /api/v1/secrets`
- `GET /api/v1/spaces/:id`
- `GET /api/v1/workbooks`
- `POST /api/v1/jobs`

**install**
```bash 
npm i @flatfile/plugin-rollout
```

**import**
```js 
import { rollout } from "@flatfile/plugin-rollout";
```

**listener.js**
```js 
listener.use(rollout({ updater: (workbooks) => {
  // update workbooks here with new schema
}}));
```
