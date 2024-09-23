# ISBN Validation and Conversion Plugin for Flatfile

This plugin provides ISBN (International Standard Book Number) validation and conversion functionality for Flatfile. It can validate both ISBN-10 and ISBN-13 formats and optionally convert ISBN-10 to ISBN-13.

## Features

- Validates ISBN-10 and ISBN-13 formats
- Adds error messages for invalid ISBNs
- Optional automatic conversion of ISBN-10 to ISBN-13
- Configurable to work on specific sheets and fields
- Concurrent processing for improved performance

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-isbn-validator
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { isbnPlugin } from '@flatfile/plugin-isbn-validator';

const listener = new FlatfileListener();

listener.use(
  isbnPlugin({
    sheetSlug: 'books',
    isbnFields: ['isbn', 'alternate_isbn'],
    autoConvert: true
  })
);
```

## Configuration

The plugin accepts a configuration object with the following properties:

- `sheetSlug` (string): The slug of the sheet to apply the plugin to
- `isbnFields` (string[]): An array of field names to validate as ISBNs
- `autoConvert` (boolean): Whether to automatically convert valid ISBN-10 to ISBN-13

## Behavior

1. The plugin processes each record in the specified sheet.
2. For each configured ISBN field, it performs the following actions:
   - Validates the ISBN format (both ISBN-10 and ISBN-13 are supported)
   - If the ISBN is invalid, it adds an error message to the record
   - If `autoConvert` is true and a valid ISBN-10 is detected, it converts it to ISBN-13
3. The plugin uses a concurrency of 5 for improved performance when processing multiple records.

Note: The plugin removes hyphens and spaces from ISBNs before processing them.