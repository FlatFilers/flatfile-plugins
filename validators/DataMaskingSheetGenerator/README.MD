# Data Masking Sheet Generator

A Flatfile plugin that automatically creates a masked version of a sheet, applying customizable data masking rules to sensitive columns.

## Features

- Automatically creates a new sheet with masked data
- Supports multiple masking techniques:
  - Hashing
  - Partial masking
  - Tokenization
  - PII masking
- Customizable masking rules
- Caches masked values for efficiency
- Adds metadata to the masked sheet for traceability

## Installation

To install the Data Masking Sheet Generator plugin, use npm:

```bash
npm install @flatfile/plugin-data-masking-sheet-generator
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import DataMaskingSheetGenerator from "@flatfile/plugin-data-masking-sheet-generator";

const listener = new FlatfileListener();

listener.use(DataMaskingSheetGenerator);

listener.configure({
  recordHooks: {
    "records:created": async (record, event) => {
      // Your existing record hook logic
      return record;
    },
  },
});
```

## Configuration

The plugin can be configured by passing options in the event payload:

```javascript
event.payload = {
  columnsToMask: ["email", "phone", "ssn"],
  maskingRules: {
    email: { type: "hash" },
    phone: { type: "partial", options: { showLastDigits: 4 } },
    ssn: { type: "tokenize", options: { tokenLength: 10 } },
  },
};
```

### Default Masking Rules

The plugin comes with default masking rules for common data types:

- email: hashed
- phone: partially masked (last 4 digits visible)
- ssn: partially masked (last 4 digits visible)
- creditCard: partially masked (last 4 digits visible)
- name: tokenized (8 characters)
- address: PII masked

## Behavior

1. When the 'records:created' event is triggered, the plugin creates a new sheet named "{OriginalSheetName} (Masked)".
2. It applies the specified masking rules to the columns defined in `columnsToMask`.
3. The plugin caches masked values to improve performance for repeated values.
4. Masked records are inserted into the new sheet.
5. Metadata about the masking process is added to the new sheet.

Note: If an error occurs during the masking process for a specific value, it will be replaced with '[MASKING_ERROR]'.