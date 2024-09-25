# Flatfile Pivot Table Plugin

This plugin for Flatfile enables the generation of pivot tables from sheet data and saves them as Markdown documents within the Flatfile ecosystem. It provides a powerful way to analyze and summarize data directly within your Flatfile workbooks.

## Features

- Generate pivot tables from Flatfile sheet data
- Support for various aggregation methods: sum, average, count, min, max
- Optional grouping functionality
- Automatic creation of Markdown documents with formatted pivot tables
- Seamless integration with Flatfile's job system and API

## Installation

To install the Flatfile Pivot Table Plugin, use npm:

```bash
npm install @flatfile/plugin-pivot-table
```

## Example Usage

Here's a basic example of how to use the Pivot Table Plugin:

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { pivotTablePlugin } from '@flatfile/plugin-pivot-table';

const listener = new FlatfileListener();

listener.use(
  pivotTablePlugin({
    apiKey: 'your_flatfile_api_key_here'
  })
);

// ... rest of your Flatfile configuration
```

## Configuration

The plugin requires a configuration object with the following property:

- `apiKey`: Your Flatfile API key (string)

## Behavior

1. The plugin listens for the 'job:ready' event with the 'workbook:submitAction' job type.
2. When triggered, it retrieves the sheet data from the specified workbook.
3. It then generates a pivot table based on the provided parameters:
   - `pivotColumn`: The column to use as the pivot
   - `aggregateColumn`: The column to aggregate
   - `aggregationMethod`: The method of aggregation (sum, average, count, min, or max)
   - `groupByColumn`: (Optional) A column to group by
4. The resulting pivot table is converted to a formatted Markdown table.
5. A new document is created in the Flatfile space containing the Markdown pivot table.
6. The job is marked as complete with a success message, or failed if an error occurs.

This plugin enhances your Flatfile experience by providing powerful data analysis capabilities directly within your data import workflow.