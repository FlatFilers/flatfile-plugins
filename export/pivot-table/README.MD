<!-- START_INFOCARD -->

The `@flatfile/plugin-export-pivot-table` plugin generates pivot tables from sheet data and saves them as Markdown documents within the Flatfile ecosystem. It provides a powerful way to analyze and summarize data directly within your Flatfile workbooks.

**Event Type:** 
`listener.on('job:ready', { job: 'workbook:generatePivotTable' })`

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

#### `pivotColumn` - `string` 
The column to use as the pivot in the generated pivot table.

#### `aggregateColumn` - `string`
The column to aggregate in the pivot table.

#### `aggregationMethod` - `'sum' | 'average' | 'count' | 'min' | 'max'`
The method to use for aggregating the data in the pivot table.

#### `groupByColumn` - `string` - (optional)
An optional column to group by in the pivot table.



## API Calls

- `api.jobs.ack`
- `api.jobs.complete`
- `api.jobs.fail`
- `api.sheets.list`
- `api.records.get`
- `api.documents.create`



## Usage

**install**
```bash install
npm i @flatfile/plugin-export-pivot-table
```

**import**
```js import
import { pivotTablePlugin } from "@flatfile/plugin-export-pivot-table";
```

**listener.js**
```js listener.js
listener.use(pivotTablePlugin({
  pivotColumn: 'Region',
  aggregateColumn: 'Sales',
  aggregationMethod: 'sum',
  groupByColumn: 'Category'
}));
```


### Full Example

**listener.js**

```js listener.js
import { pivotTablePlugin } from "@flatfile/plugin-export-pivot-table";

export default function (listener) {
  listener.use(pivotTablePlugin({
    pivotColumn: 'Region',
    aggregateColumn: 'Sales',
    aggregationMethod: 'sum',
    groupByColumn: 'Category'
  }));

  // rest of listener.js
}
```

## Functionality

The pivot table plugin performs the following steps:

1. Listens for the 'job:ready' event with the 'workbook:generatePivotTable' job type.
2. Retrieves the sheet data from the specified workbook.
3. Generates a pivot table based on the provided configuration:
   - Uses the specified pivot column
   - Aggregates data from the aggregate column
   - Applies the chosen aggregation method (sum, average, count, min, or max)
   - Groups by the optional group-by column if provided
   - Calculates totals for each pivot value
4. Converts the resulting pivot table to a formatted Markdown table.
5. Creates a new document in the Flatfile space containing the Markdown pivot table.
6. Marks the job as complete with a success message, or failed if an error occurs.

This plugin enhances your Flatfile experience by providing powerful data analysis capabilities directly within your data import workflow.

## Output Format

The plugin generates a Markdown-formatted pivot table. Here's an example of what the output might look like:

```markdown
# Pivot Table

- Pivot Column: Region
- Aggregate Column: Sales Amount
- Aggregation Method: sum
- Group By Column: Category

| Region | Electronics | Furniture | Total |
|--------|-------------|-----------|-------|
| North  | 1750.00     | 480.00    | 2230.00 |
| South  | 1820.00     | 280.00    | 2100.00 |
| East   | 2050.00     | 460.00    | 2510.00 |
| West   | 1320.00     | 200.00    | 1520.00 |
```

The table includes both grouped data (if a group-by column is provided) and totals for each pivot value. Values are formatted to two decimal places for readability.