# Flatfile Date Normalization Plugin

A Flatfile Listener plugin for normalizing dates to ISO 8601 format. This plugin automatically converts various date formats to a standardized ISO 8601 format, enhancing data consistency and compatibility.

## Features

- Converts multiple date formats to ISO 8601
- Configurable for specific sheets and date fields
- Option for automatic conversion or computed fields
- Error handling for unsupported date formats
- Concurrency support for improved performance

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-date-normalization
```

## Example Usage

```typescript
import { FlatfileListener } from "@flatfile/listener";
import dateNormalizationPlugin from "@flatfile/plugin-date-normalization";

const listener = new FlatfileListener();

dateNormalizationPlugin(listener, {
  sheetSlug: "employees",
  dateFields: ["birthDate", "hireDate"],
  autoConvert: true
});

// ... rest of your Flatfile setup
```

## Configuration

The plugin accepts a configuration object with the following properties:

- `sheetSlug` (string, required): The slug of the sheet to apply the plugin to.
- `dateFields` (string[], required): An array of field names to be processed for date normalization.
- `autoConvert` (boolean, optional): If true, the original field will be overwritten with the normalized date. If false, a computed field will be created. Default is false.

## Behavior

1. The plugin processes each record in the specified sheet.
2. For each configured date field, it attempts to parse the date using various common formats.
3. If successful, it converts the date to ISO 8601 format (YYYY-MM-DDTHH:mm:ss.SSSZ).
4. Depending on the `autoConvert` setting, it either overwrites the original field or creates a computed field with the normalized date.
5. If the date cannot be parsed, an error is added to the record for that field.
6. The plugin runs with a concurrency of 10 records at a time for improved performance.
7. Any errors during the process are logged to the console.

This plugin helps standardize date formats in your Flatfile projects, making it easier to work with dates from various sources and ensuring consistency in your data output.