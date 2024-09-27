# Boolean Validator Plugin for Flatfile

This plugin implements a Boolean Validator for Flatfile Listener that validates and converts boolean values in Flatfile records. It supports various options for validation, including multi-language representations, custom truthy/falsy values, and batch processing for large datasets.

## Features

- Strict or lenient boolean validation
- Custom truthy and falsy value support
- Multi-language representations
- Case-sensitive or case-insensitive validation
- Null value handling
- Conversion of non-boolean values
- Customizable error messages
- Default value option
- Batch processing for large datasets

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-boolean-validator
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import booleanValidatorPlugin from "@flatfile/plugin-boolean-validator";

const listener = new FlatfileListener();

listener.use(
  booleanValidatorPlugin(listener, {
    strict: false,
    allowTruthyFalsy: true,
    caseSensitive: false,
    allowNull: true,
    convertNonBoolean: true,
    languageRepresentations: {
      en: { true: ["true", "yes"], false: ["false", "no"] },
      es: { true: ["verdadero", "sí"], false: ["falso", "no"] },
    },
    errorMessages: {
      invalidBoolean: "Invalid boolean value",
    },
    defaultValue: null,
    batchSize: 1000,
  })
);
```

## Configuration

The plugin accepts a `ValidationOptions` object with the following properties:

- `strict`: Boolean, if true, only allows "true" and "false" values
- `allowTruthyFalsy`: Boolean, allows custom truthy/falsy values
- `customTruthyValues`: Array of strings, custom truthy values
- `customFalsyValues`: Array of strings, custom falsy values
- `caseSensitive`: Boolean, enables case-sensitive validation
- `allowNull`: Boolean, allows null values
- `convertNonBoolean`: Boolean, converts non-boolean values to boolean
- `languageRepresentations`: Object, multi-language representations for true/false
- `errorMessages`: Object, custom error messages
- `defaultValue`: Boolean or null, default value for invalid inputs
- `batchSize`: Number, batch size for processing large datasets

## Behavior

1. The plugin processes all fields ending with "_bool".
2. It validates the input based on the provided configuration.
3. If the input is valid, it converts it to a boolean value.
4. If the input is invalid:
   - It assigns the default value if provided.
   - It adds an error message to the record if no default value is set.
5. The plugin processes records in batches for better performance with large datasets.

For detailed behavior on specific input types and validation rules, please refer to the source code and comments.