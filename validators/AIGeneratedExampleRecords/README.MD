# Flatfile AI Generator Plugin

This Flatfile Listener plugin automatically generates example records using AI, providing realistic and contextually appropriate data for your sheets. It leverages the Anthropic API with the Claude 3 Sonnet model to analyze sheet configuration and create diverse sample data.

## Features

- Automatically generates example records based on sheet structure
- Configurable number of records to generate
- Uses advanced AI to create contextually appropriate data
- Seamless integration with Flatfile workflows
- Error handling and logging for reliable operation

## Installation

To install the AI Generator Plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-ai-generator
```

## Example Usage

```typescript
import { FlatfileListener } from '@flatfile/listener';
import { aiGeneratorPlugin } from '@flatfile/plugin-ai-generator';

const listener = new FlatfileListener();

listener.use(
  aiGeneratorPlugin({
    numberOfRecords: 10
  })
);
```

## Configuration

The AI Generator Plugin accepts a configuration object with the following property:

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

## License

This project is licensed under the MIT License.