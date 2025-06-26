# @flatfile/plugin-merge

Merge records in a sheet based on key fields with configurable treatments for non-key fields.

## Installation

```bash
npm install @flatfile/plugin-merge
```

## Usage

```javascript
import { mergePlugin } from '@flatfile/plugin-merge'

// Basic usage - merge by 'id' field, overwrite with last value
listener.use(mergePlugin('sheet:merge-records', {
  keys: ['id'],
  defaultTreatment: 'overwrite',
  overwriteHeuristic: 'last'
}))

// Advanced usage with per-field treatments
listener.use(mergePlugin('sheet:merge-records', {
  keys: ['customer_id', 'product_id'],
  treatments: {
    'name': { type: 'overwrite', heuristic: 'first' },
    'tags': { type: 'list' },
    'description': { type: 'overwrite', heuristic: 'last' }
  },
  defaultTreatment: 'overwrite',
  overwriteHeuristic: 'last'
}))

// Custom merge logic
listener.use(mergePlugin('sheet:merge-records', {
  keys: ['id'],
  defaultTreatment: 'overwrite',
  overwriteHeuristic: 'custom',
  custom: (records, compositeKey, fieldKey) => {
    // Custom logic to determine which value to keep
    return records.find(r => r.values[fieldKey]?.value)?.values[fieldKey]?.value
  }
}))

// Use all fields as merge key (when keys is empty or omitted)
listener.use(mergePlugin('sheet:merge-records', {
  defaultTreatment: 'overwrite',
  overwriteHeuristic: 'last'
}))
```

## Configuration

### Options

- `keys` (string[], optional): Array of field keys to use for matching records. If empty or omitted, all fields are used as the merge key.
- `treatments` (Record<string, FieldTreatment>, optional): Specific treatments for individual fields.
- `defaultTreatment` ('overwrite' | 'list', default: 'overwrite'): Default treatment for fields not specified in treatments.
- `overwriteHeuristic` ('first' | 'last' | 'custom', default: 'last'): Heuristic for overwrite treatment.
- `custom` (function, optional): Custom function for merge logic when using 'custom' heuristic.
- `debug` (boolean, optional): Enable debug logging.

### Field Treatments

- `overwrite`: Keep one value based on heuristic (first, last, or custom)
- `list`: Combine all non-null values into a list (requires string-list, enum-list, or reference-list field type)

### Heuristics

- `first`: Keep the first non-null value encountered
- `last`: Keep the last non-null value encountered  
- `custom`: Use custom function to determine value

## Field Type Validation

When using `list` treatment, the plugin validates that the target field accepts list values:
- `string-list`
- `enum-list` 
- `reference-list`

If a field doesn't support lists, the merge operation will fail with an informative error message.

## Examples

### Merge by Single Key

```javascript
// Merge records with the same 'customer_id'
listener.use(mergePlugin('sheet:merge-records', {
  keys: ['customer_id'],
  defaultTreatment: 'overwrite',
  overwriteHeuristic: 'last'
}))
```

### Merge by Multiple Keys

```javascript
// Merge records with the same combination of 'customer_id' and 'product_id'
listener.use(mergePlugin('sheet:merge-records', {
  keys: ['customer_id', 'product_id'],
  defaultTreatment: 'overwrite',
  overwriteHeuristic: 'last'
}))
```

### Mixed Treatments

```javascript
// Different treatment for each field
listener.use(mergePlugin('sheet:merge-records', {
  keys: ['id'],
  treatments: {
    'name': { type: 'overwrite', heuristic: 'first' },
    'tags': { type: 'list' },
    'notes': { type: 'overwrite', heuristic: 'last' },
    'categories': { type: 'list' }
  },
  defaultTreatment: 'overwrite'
}))
```

### Custom Merge Logic

```javascript
// Use custom logic to determine which value to keep
listener.use(mergePlugin('sheet:merge-records', {
  keys: ['id'],
  defaultTreatment: 'overwrite',
  overwriteHeuristic: 'custom',
  custom: (records, compositeKey, fieldKey) => {
    // Keep the value with the most characters
    return records
      .map(r => r.values[fieldKey]?.value)
      .filter(v => v != null && v !== '')
      .sort((a, b) => String(b).length - String(a).length)[0]
  }
}))
```
