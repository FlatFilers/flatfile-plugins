# @flatfile/plugin-column-copier

A Flatfile plugin to copy data from one column to another.

## Installation

```bash
npm install @flatfile/plugin-column-copier
```

## Usage

```typescript
import { FlatfileListener } from '@flatfile/listener'
import { columnCopierPlugin } from '@flatfile/plugin-column-copier'

const listener = new FlatfileListener()
columnCopierPlugin(listener)

// ... rest of your Flatfile setup
```

## Configuration

The plugin listens for a 'job:ready' event with the operation name "copy-columns". The job payload should include:

- `source`: The name of the source column
- `target`: The name of the target column

## Example

To use this plugin, you need to trigger a job with the following payload:

```json
{
  "operation": "copy-columns",
  "source": "sourceColumnName",
  "target": "targetColumnName"
}
```

## License

MIT
