<!-- START_INFOCARD -->

# @flatfile/plugin-import-llm-records

The `@flatfile/plugin-import-llm-records` plugin automatically generates example records using an LLM of your choice, providing realistic and contextually relevant records for your Sheet by analyzing the Sheet's Field configuration.

**Event Type:** 
`job:ready`

<!-- END_INFOCARD -->

## Features

- Automatically generates example records based on Sheet's Field configuration
- Configurable number of records to generate
- Uses advanced LLMs to create contextually appropriate data
- Seamless integration with Flatfile workflows
- Error handling and logging for reliable operation

## Parameters

The `importLLMRecords` function accepts a configuration object with the following properties:

- `llmSecretName` (string): The name of the secret that contains the LLM API key.
- `model` (string): The name of the LLM to use.
- `job` (string): The Sheet-level operation name to listen for in the job:ready event.
- `numberOfRecords` (number): The number of example records to generate (default: 10)
- `debug` (boolean): Whether to log debug information (default: false)

## Installation

To install the LLM Record Generator Plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-import-llm-records
```

## Example Usage

```typescript
import type { FlatfileListener } from '@flatfile/listener';
import { importLLMRecords } from '@flatfile/plugin-import-llm-records';

export default function (listener: FlatfileListener) {
  listener.use(
    importLLMRecords({
      llmSecretName: 'LLM_API_KEY',
      model: 'gpt-4o',
      job: 'generateExampleRecords',
      numberOfRecords: 10
    })
  )
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.