<!-- START_INFOCARD -->

The `@flatfile/plugin-automap` plugin listens for and responds to file extraction jobs and then creates a mapping job for automation. Currently, every field in the Job Execution plan must meet the minimum confidence level specified by the `accuracy` config prop.

<!-- END_INFOCARD -->

> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](https://flatfile.com/docs/orchestration/listeners#listener-types)


## Parameters

#### `accuracy` - `'confident' | 'exact'` - (required)

The `accuracy` parameter match columns either by 'confident' (> 90% match) or 'exact' (100% match).


#### `debug` - `boolean`

The `debug` parameter lets you toggle on/off helpful debugging messages for development purposes.


#### `defaultTargetSheet` - `'string' | '(fileName: string) => string | Promise'`

The `defaultTargetSheet` parameter takes the exact sheet slug or a callback function that resolves to the exact sheet slug to import data to.


#### `matchFilename` - `RegExp`

The `matchFilename` parameter takes a regular expression to match specific files to perform automapping on.


#### `onFailure` - `(event: FlatfileEvent) => void | Promise<void>`

The `onFailure` parameter takes a callback function to be executed when plugin bails. The callback can be synchronous or asynchronous.


#### `targetWorkbook` - `string`

The `targetWorkbook` parameter specifies destination Workbook id or name.


## API Calls

- `api.files.get`
- `api.files.update`
- `api.jobs.create`
- `api.jobs.execute`
- `api.jobs.getExecutionPlan`
- `api.workbooks.list`
- `api.workbooks.get`


## Usage

For automation workflows, upload a file using the `files` endpoint. For testing, you import via the Files area in the UI and use the `debug` config property.

**Install**  

```bash install
npm i @flatfile/plugin-automap
```

**Import**  

```ts
import { automap } from "@flatfile/plugin-automap";
```

**listener.ts**  

```ts listener.ts
listener.use(
  automap({
    accuracy: "confident",
    defaultTargetSheet: "Contact",
    matchFilename: /test.csv$/g,
    onFailure: async (event: FlatfileEvent) => {
      // send an SMS, an email, post to an endpoint, etc.
      console.error(
        `Please visit https://spaces.flatfile.com/space/${event.context.spaceId}/files?mode=import to manually import file.`
      );
    },
  })
);
```
