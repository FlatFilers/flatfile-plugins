<!-- START_INFOCARD -->
# @flatfile/plugin-validate-boolean

The `@flatfile/plugin-validate-boolean` plugin provides comprehensive boolean validation capabilities, offering flexible configuration options to handle various boolean representations across different languages and use cases.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->

## Features

- Supports both strict and truthy boolean validation
- Multi-language support (English, Spanish, French, German)
- Custom mapping for boolean values
- Case-sensitive and case-insensitive options
- Configurable null value handling
- Option to convert non-boolean values
- Custom error messages
- Default value setting

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-validate-boolean
```

## Example Usage

```javascript
import { validateBoolean } from '@flatfile/plugin-validate-boolean';

const booleanValidator = validateBoolean({
  fields: ['isActive', 'hasSubscription'],
  validationType: 'truthy',
  language: 'en',
  handleNull: 'false',
  convertNonBoolean: true
});

listener.use(booleanValidator);
```

## Configuration

The `BooleanValidator` function accepts a configuration object with the following properties:

- `fields`: An array of field names to validate
- `validationType`: 'strict' or 'truthy'
- `customMapping`: A custom mapping of string values to boolean
- `caseSensitive`: Whether the validation should be case-sensitive
- `handleNull`: How to handle null values ('error', 'false', 'true', or 'skip')
- `convertNonBoolean`: Whether to convert non-boolean values to boolean
- `language`: The language for predefined mappings ('en', 'es', 'fr', 'de')
- `customErrorMessages`: Custom error messages for different scenarios
- `defaultValue`: A default value to use for invalid inputs

## Behavior

1. **Strict Validation**: Only accepts 'true', 'false', true, or false as valid inputs.
2. **Truthy Validation**: Accepts various representations of true/false, including language-specific terms.
3. **Null Handling**: Configurable behavior for null or undefined values.
4. **Non-Boolean Conversion**: Option to convert non-boolean values to boolean.
5. **Error Handling**: Adds errors or info messages to the record for invalid inputs.
6. **Default Value**: Option to set a default value for invalid inputs instead of raising an error.

The plugin can be used either as a RecordHook or as an external constraint, providing flexibility in integration with your Flatfile setup.
