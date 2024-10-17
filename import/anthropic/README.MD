<!-- START_INFOCARD -->

# @flatfile/plugin-import-anthropic

This Flatfile Listener plugin automatically generates example records using Anthropic, providing realistic and contextually appropriate data for your sheets. It leverages the Anthropic API with the Claude 3 Sonnet model to analyze sheet configuration and create diverse sample data.

**Event Type:** 
`job:ready`

<!-- END_INFOCARD -->

## Features

- Automatically generates example records based on sheet structure
- Configurable number of records to generate
- Uses advanced AI to create contextually appropriate data
- Seamless integration with Flatfile workflows
- Error handling and logging for reliable operation

## Parameters

The `anthropicGenerator` function accepts a configuration object with the following properties:

- `job` (string): The operation name to listen for in the job:ready event.
- `numberOfRecords` (number): The number of example records to generate (default: 10)
- `debug` (boolean): Whether to log debug information (default: false)

## Installation

To install the Anthropic Generator Plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-import-anthropic
```

## Example Usage

```typescript
import type { FlatfileListener } from '@flatfile/listener';
import { anthropicGenerator } from '@flatfile/plugin-import-anthropic';

export default function (listener: FlatfileListener) {
  listener.use(
    anthropicGenerator({
      job: 'generateExampleRecords',
      numberOfRecords: 10
    })
  )
}
```

## Configuration

The Anthropic Generator Plugin accepts a configuration object with the following property:

- `numberOfRecords`: The number of example records to generate (default: 10)

## Behavior

1. When a record hook is triggered, the plugin checks if the record is already an generated example.
2. If not, it retrieves the sheet configuration from the event.
3. The plugin then uses the Anthropic API to generate the specified number of example records based on the sheet's field types and constraints.
4. Generated records are added to the sheet using the Flatfile API.
5. The plugin marks processed records to avoid duplicate generation.
6. On the 'job:ready' event, the plugin updates the workbook sheet.

## Requirements

- An Anthropic API key must be set in the `ANTHROPIC_API_KEY` environment variable.

## Error Handling

The plugin includes error handling and logging to ensure reliable operation. Any errors during the generation or insertion process are logged for easy troubleshooting.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.