# Flatfile String Configuration Plugin

A powerful and flexible Flatfile Listener plugin for string configuration and validation. This plugin combines multiple string validations in a single configuration, including regex pattern matching, length validation, case sensitivity, trimming options, and custom transformations.

## Features

- Regular expression pattern matching
- Length validation (min, max, exact)
- Case type enforcement (lowercase, uppercase, titlecase)
- Whitespace trimming (leading, trailing)
- Custom transformation functions
- Configurable error messages
- Common regex patterns for email, phone, and URL validation
- Empty string handling

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-string-config
```

## Example Usage

```typescript
import { FlatfileListener } from '@flatfile/listener';
import { stringConfigPlugin } from '@flatfile/plugin-string-config';

const listener = new FlatfileListener();

const stringConfigs = {
  email: {
    pattern: commonRegexPatterns.email,
    trim: { leading: true, trailing: true },
    errorMessages: {
      pattern: 'Invalid email format',
    },
  },
  name: {
    minLength: 2,
    maxLength: 50,
    caseType: 'titlecase',
    errorMessages: {
      length: 'Name must be between 2 and 50 characters',
      case: 'Name must be in Title Case',
    },
  },
};

listener.use(stringConfigPlugin(stringConfigs));
```

## Configuration

The `stringConfigPlugin` accepts a configuration object where each key represents a field name and its value is a `StringValidationConfig` object with the following properties:

- `pattern`: RegExp - A regular expression pattern to match against
- `minLength`: number - Minimum length of the string
- `maxLength`: number - Maximum length of the string
- `exactLength`: number - Exact required length of the string
- `caseType`: 'lowercase' | 'uppercase' | 'titlecase' - Enforces specific case type
- `trim`: { leading?: boolean, trailing?: boolean } - Trims whitespace
- `customTransform`: (value: string) => string - Custom transformation function
- `emptyStringAllowed`: boolean - Whether empty strings are allowed
- `errorMessages`: Object with custom error messages for different validations

## Behavior

The plugin processes each record in the Flatfile import, applying the configured validations to the specified fields. If a validation fails, an error is added to the record for that field. If a custom transformation is specified and all validations pass, the transformed value is set for the field.

The plugin uses the `recordHook` to process individual records, allowing for efficient and flexible validation and transformation of string fields during the import process.