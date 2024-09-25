# Flatfile External API Export Plugin

This plugin for Flatfile enables exporting data to an external API with advanced features such as batching, error handling, retry logic, and user notifications. It processes records from Flatfile, maps them to the desired format, and exports them in batches to a specified external API endpoint.

## Features

- Data mapping from Flatfile fields to external API fields
- Batch processing for efficient exports
- Configurable batch size
- Retry logic with configurable max retries and delay
- Detailed progress tracking and job status updates
- Error handling and logging
- User notifications for export completion or failure
- Support for custom record validation

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-external-api-export
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import externalApiExportPlugin from '@flatfile/plugin-external-api-export';

const listener = new FlatfileListener();

listener.use(
  externalApiExportPlugin({
    apiEndpoint: 'https://api.example.com/import',
    authToken: 'your-api-token',
    dataMapping: {
      'First Name': 'firstName',
      'Last Name': 'lastName',
      'Email': 'emailAddress'
    },
    batchSize: 100,
    maxRetries: 3,
    retryDelay: 1000
  })
);

listener.on('job:ready', async ({ context, payload }) => {
  // Additional job:ready handling if needed
});
```

## Configuration

The plugin accepts the following configuration options:

- `apiEndpoint` (string): The URL of the external API endpoint to send data to.
- `authToken` (string): The authentication token for the external API.
- `dataMapping` (object): A mapping of Flatfile field names to external API field names.
- `batchSize` (number): The number of records to process in each batch.
- `maxRetries` (number): The maximum number of retry attempts for failed API calls.
- `retryDelay` (number): The delay (in milliseconds) between retry attempts.

## Behavior

1. When a job is ready, the plugin retrieves all records for the specified file.
2. Records are processed in batches according to the configured `batchSize`.
3. Each record is mapped to the format expected by the external API using the `dataMapping` configuration.
4. The plugin attempts to export each batch to the external API.
5. If an export fails, the plugin will retry the operation up to `maxRetries` times, with a delay of `retryDelay` milliseconds between attempts.
6. Progress is tracked and reported throughout the export process.
7. Successful exports are logged, and failed exports are recorded for error reporting.
8. Upon completion, a summary of the export process is provided, including the number of successful and failed exports.
9. User notifications are sent to inform about the export status.

The plugin also includes a record hook for the 'contacts' sheet, allowing for custom validation logic to be implemented before export.