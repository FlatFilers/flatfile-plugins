<!-- START_INFOCARD -->

The `@flatfile/plugin-convert-sql-ddl` plugin will automatically convert SQL
DDL to the Flatfile Blueprint, a powerful DDL (Data Definition Language)
created by Flatfile with a focus on validation and data preparation.

**Event Type:**
`listener.on('space:configure')`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

#### setupFactory` - `SqlSetupFactory` - (required)
The `setupFactory` parameter holds the Workbook and Sheet configuration
options and SQL DDL source.


#### callback` - `function`
The `callback` parameter receives three arguments: `event`, `workbookIds`, and
a `tick` function. The `tick` function can be used to update the Job's
progress. The `callback` function is invoked once the Space and Workbooks are
fully configured.



## API Calls

- `api.spaces.update`
- `api.workbooks.create`



## Usage

The `@flatfile/plugin-convert-sql-ddl` plugin simplifies the setup of new Flatfile Spaces by configuring the Space from a provided SQL DDL.

Designed for server-side listeners, it auto-configures the Space using the supplied settings.

#### Install

```bash install
npm i @flatfile/plugin-convert-sql-ddl
```

#### Import

```js import
import { configureSpaceWithSqlDDL } from "@flatfile/plugin-convert-sql-ddl";
```

#### `listener.js`

```js listener.js
listener.use(
  configureSpaceWithSqlDDL({
    workbooks: [
      {
        name: "SQL DDL Generated Workbook",
        source: "src/data/example.sql",
        sheets: [
          {
            name: "Users",
            slug: "user",
          },
          {
            name: "Products",
            slug: "products",
          },
          {
            name: "Locations",
            slug: "locations",
          },
        ],
      },
    ],
  })
);
```