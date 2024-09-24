# Flatfile Phone Format Plugin

A customizable Flatfile Listener plugin for formatting phone numbers based on country codes. This plugin processes individual records, formats phone numbers according to country-specific patterns, and handles errors.

## Features

- Supports phone number formatting for multiple countries (US, UK, India, Germany, France, Brazil)
- Customizable configuration options
- Automatic error handling and reporting
- Optional automatic conversion of phone numbers to formatted versions
- Configurable concurrency for record processing

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-phone-format
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import phoneFormatPlugin from '@flatfile/plugin-phone-format';

const listener = new FlatfileListener();

listener.use(phoneFormatPlugin({
  sheetSlug: 'contacts',
  phoneField: 'phone_number',
  countryField: 'country_code',
  autoConvert: true
}));

// ... rest of your Flatfile setup
```

## Configuration

The plugin accepts the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| sheetSlug | string | 'contacts' | The slug of the sheet to apply the plugin to |
| phoneField | string | 'phone' | The field name containing the phone number |
| countryField | string | 'country' | The field name containing the country code |
| autoConvert | boolean | true | Whether to automatically convert phone numbers to formatted versions |

## Behavior

1. The plugin processes each record in the specified sheet.
2. It checks for the presence of both phone number and country fields.
3. If either is missing, an error is added to the record.
4. The phone number is validated against the country-specific pattern.
5. If valid, the number is formatted according to the country's standard format.
6. If `autoConvert` is true, the formatted number replaces the original value.
7. If the number is invalid, an error is added to the record.

The plugin uses a concurrency of 5 for record processing and includes debug logging.

Supported country formats:
- US: (123) 456-7890
- UK: 123 4567 8901
- India: 123-456-7890
- Germany: 123 4567 8901
- France: 12 34 56 78
- Brazil: (12) 3456-7890

For unsupported countries, the plugin will return an error message.