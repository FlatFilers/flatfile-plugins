<!-- START_INFOCARD -->

# @flatfile/plugin-import-llm

This Flatfile Listener plugin automatically generates example records using an LLM, providing realistic and contextually appropriate data for your sheets. It leverages the the user-selected LLM to analyze sheet configuration and create diverse sample data.

**Event Type:** 
`job:ready`

<!-- END_INFOCARD -->

## Features

- Automatically generates example records based on sheet structure
- Configurable number of records to generate
- Uses advanced LLMs to create contextually appropriate data
- Seamless integration with Flatfile workflows
- Error handling and logging for reliable operation

## Parameters

The `llmRecordGenerator` function accepts a configuration object with the following properties:

- `llmSecretName` (string): The name of the secret that contains the LLM API key.
- `model` (string): The name of the LLM to use.
- `job` (string): The sheet-level operation name to listen for in the job:ready event.
- `numberOfRecords` (number): The number of example records to generate (default: 10)
- `debug` (boolean): Whether to log debug information (default: false)

## Installation

To install the LLM Record Generator Plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-import-llm
```

## Example Usage

```typescript
import type { FlatfileListener } from '@flatfile/listener';
import { llmRecordGenerator } from '@flatfile/plugin-import-llm';

export default function (listener: FlatfileListener) {
  listener.use(
    llmRecordGenerator({
      llmSecretName: 'LLM_API_KEY',
      model: 'gpt-4o',
      job: 'generateExampleRecords',
      numberOfRecords: 10
    })
  )
}
```

## Behavior

1. When the Sheet Action is triggered, it retrieves the Sheet field configuration from the event.
2. The plugin then uses the user-selected LLM to generate the specified number of example Records based on the Sheet's field types and constraints.
3. Generated Records are added to the Sheet using the Flatfile API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.