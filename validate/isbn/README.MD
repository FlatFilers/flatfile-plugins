<!-- START_INFOCARD -->

The `@flatfile/plugin-validate-isbn` Plugin is a powerful tool for validating ISBN (International Standard Book Number) fields during data import. It offers comprehensive validation for both ISBN-10 and ISBN-13 formats, including structure checks, check digit verification, and optional conversion between formats.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->

A Flatfile Listener plugin for validating ISBN (International Standard Book Number) fields in your data import process. This plugin provides robust ISBN validation, including format checks, check digit verification, and optional ISBN-10 to ISBN-13 conversion.

## Features

- Validates both ISBN-10 and ISBN-13 formats
- Checks for correct ISBN structure and valid check digits
- Provides specific error messages for different types of validation failures
- Optionally converts ISBN-10 to ISBN-13 automatically
- Optionally formats ISBN hyphenated 
- Configurable for multiple ISBN fields within a sheet

## Installation

Install the plugin using npm:

```bash
npm install @flatfile/plugin-validate-isbn
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import isbnValidator from "@flatfile/plugin-validate-isbn";

const listener = new FlatfileListener();

listener.use(
  isbnValidator({
    sheetSlug: "books",
    isbnFields: ["isbn", "alternate_isbn"],
    format: "isbn13",
    autoFormat: true
  })
);

// ... rest of your Flatfile configuration
```

## Configuration

The `isbnValidator` function accepts a configuration object with the following properties:

- `sheetSlug` (string): The slug of the sheet where ISBN validation should be applied.
- `isbnFields` (string[]): An array of field names that contain ISBN values to be validated.
- `autoFormat` (boolean): If true, ISBN numbers will be hyphenated.
- `format` (string, optional): Manually set the output format of the ISBN. Can be one of:
  - 'isbn13': 13-digit ISBN without hyphens
  - 'isbn13h': 13-digit ISBN with hyphens
  - 'isbn10': 10-digit ISBN without hyphens
  - 'isbn10h': 10-digit ISBN with hyphens

## Behavior

1. The plugin validates each specified ISBN field in every record of the configured sheet.
2. It removes hyphens and spaces from the ISBN before validation.
3. For ISBN-10:
   - Checks if the format is valid (9 digits followed by a digit or 'X').
   - Verifies the check digit.
   - If `autoConvert` is true, converts valid ISBN-10 to ISBN-13.
4. For ISBN-13:
   - Checks if the format is valid (13 digits).
   - Verifies the check digit.
5. Adds appropriate error messages to the record for any validation failures.
6. If a field is empty, it adds an error indicating that ISBN is required.

This plugin enhances data quality by ensuring that ISBN fields contain valid and properly formatted book identifiers.
