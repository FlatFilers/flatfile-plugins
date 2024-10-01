# Flatfile Number Validation Plugin

This Flatfile Listener plugin provides comprehensive number validation capabilities for your data import processes. It offers a wide range of validation options to ensure that numeric data meets specific criteria before being accepted.

## Features

- Min/Max value validation
- Integer-only validation
- Precision and scale validation
- Currency formatting validation
- Step (increment) validation
- Special number type validation (prime, even, odd)
- Rounding and truncation options
- Customizable thousands separator and decimal point
- Inclusive/exclusive range validation

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-number-validation
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { validateNumber } from '@flatfile/plugin-validate-number';

const listener = new FlatfileListener();

listener.use(
  validateNumber({
    min: 0,
    max: 1000,
    inclusive: true,
    integerOnly: true,
    precision: 10,
    scale: 2,
    currency: true,
    step: 5,
    thousandsSeparator: ',',
    decimalPoint: '.',
    specialTypes: ['even'],
    round: true
  })
);
```

## Configuration

The `validateNumber` accepts a configuration object with the following options:

- `min`: Minimum allowed value
- `max`: Maximum allowed value
- `inclusive`: Whether the min/max range is inclusive
- `integerOnly`: Allow only integer values
- `precision`: Total number of digits allowed
- `scale`: Number of decimal places allowed
- `currency`: Validate as a currency value
- `step`: Increment value (e.g., multiples of 5)
- `thousandsSeparator`: Character used as thousands separator
- `decimalPoint`: Character used as decimal point
- `specialTypes`: Array of special number types to validate ('prime', 'even', 'odd')
- `round`: Round the number to the nearest integer
- `truncate`: Truncate the decimal part of the number

## Behavior

The plugin listens for the 'commit:created' event and performs validation on a specified number field (default field name is 'numberField'). It applies the configured validations and throws an error if any validation fails.

The plugin also handles number parsing, considering the specified thousands separator and decimal point. It can optionally round or truncate the number before applying validations.

If all validations pass, the plugin logs a success message. If any validation fails, it logs an error message and throws an error with a descriptive message about the validation failure.
