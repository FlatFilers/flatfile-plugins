<!-- START_INFOCARD -->

# @flatfile/plugin-autocast
**Automatically cast values in Flatfile to their appropriate types with this plugin.**


The `@flatfile/plugin-autocast` plugin is an opinionated transformer that will
automatically convert the data in the Sheet to match the type defined by the
Blueprint.


**Event Type:**
`listener.on('commit:created')`


**Supported field types:**
`number`, `boolean`, `date`

<!-- END_INFOCARD -->


## Parameters

#### `sheetSlug` - `string` - (required)

The `sheetSlug` indicates the slug name of the sheet you want to monitor.

#### `fieldFilters` - `string[]`

Use the `fieldFilters` parameter to select specific fields to monitor. Without
any specified `fieldFilters`, the plugin will automatically monitor
all castable fields, including strings, numbers, booleans, and dates.


#### `options.chunkSize` - `default: "10_000"` - `number`

The `chunkSize` parameter allows you to specify the quantity of records to in
each chunk.

#### `options.parallel` - `default: "1"` - `number`

The `parallel` parameter allows you to specify the number of chunks to process
in parallel.


## API Calls

- `api.sheets.get`


## Usage

The `autocast` plugin will listen for the `commit:created` event and cast strings, numbers, booleans,
and dates to the appropriate Blueprint type. Note that the `recordHook` and `bulkRecordHook` plugins
listen for the same event type. Plugins will fire in the order they are placed in the listener.

### Strings

Numbers and booleans are transformed from strings to their respective types (i.e., `'1'` to `1`, `"true"` to `true`).

### Numbers

String numbers (i.e `'1'`), string decimals (i.e `'1.1'`), and string numbers with commas (i.e `'1,000'`)
are interpreted as numbers.

### Booleans

`'1'`, `'yes'`, `'true'`, `'on'`, `'t'`, `'y'`, and `1` are interpreted as truthy values.

`'-1'`, `'0'`, `'no'`, `'false'`, `'off'`, `'f'`, `'n'`, `0`, `-1` are interpreted as falsy values.

### Dates

Date strings and numbers are cast to UTC strings. For example, `YYYY-MM-DD...` formats are treated as ISO 8601 dates (UTC), whereas other formats are considered local time and converted to UTC:

- `'2023-08-16'` => `'Wed, 16 Aug 2023 00:00:00 GMT'`
- `'08-16-2023'` => `'Wed, 16 Aug 2023 00:00:00 GMT'`
- `'08/16/2023'` => `'Wed, 16 Aug 2023 00:00:00 GMT'`
- `'Aug 16, 2023'` => `'Wed, 16 Aug 2023 00:00:00 GMT'`
- `'August 16, 2023'` => `'Wed, 16 Aug 2023 00:00:00 GMT'`
- `'2023-08-16T00:00:00.000Z'` => `'Wed, 16 Aug 2023 00:00:00 GMT'`
- `1692144000000` => `'Wed, 16 Aug 2023 00:00:00 GMT'`

**install**
```bash 
npm i @flatfile/plugin-autocast
```

**import**
```js 
import { autocast } from "@flatfile/plugin-autocast";
```

**listener.js**
```js 
listener.use(autocast("sheetSlug"));
```
**listener.js w/ fieldFilters**
```js 
listener.use(autocast("sheetSlug", ["numberField", "dateField"]));
```
**listener.js w/ fieldFilters & options**
```js 
listener.use(
  autocast("sheetSlug", ["numberField", "dateField"], {
    chunkSize: 10_000,
    parallel: 2,
  })
);
```
