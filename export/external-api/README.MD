<!-- START_INFOCARD -->

# @flatfile/plugin-export-external-api

This plugin for Flatfile enables exporting data to an external API with advanced features such as batching, error handling, retry logic, and user notifications. It processes records from Flatfile, maps them to the desired format, and exports them in batches to a specified external API endpoint.

**Event Type:** `job:ready`

<!-- END_INFOCARD -->

## Features

- Batch processing for efficient exports
- Configurable batch size
- Retry logic with configurable max retries and delay
- Detailed progress tracking and job status updates
- Error handling and logging
- User notifications for export completion or failure
- Support for custom record validation

## Parameters

#### `job` - `string` - (required)
The type of job to create.

#### `apiEndpoint` - `string` - (required)
The URL of the external API endpoint to send data to.

#### `secretName` - `string` - (required)
The name of the Flatfile Secret that contains the authentication token for the external API.

#### `batchSize` - `number` - (required)
The number of records to process in each batch.

#### `maxRetries` - `number` - (required)
The maximum number of retry attempts for failed API calls.

#### `retryDelay` - `number` - (required)
The delay (in milliseconds) between retry attempts.


## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-export-external-api
```

## Example Usage

```javascript
import { exportToExternalAPIPlugin } from '@flatfile/plugin-export-external-api';

export default function (listener) {
  listener.use(
    exportToExternalAPIPlugin({
      apiEndpoint: 'https://api.example.com/import',
      secretName: 'YOUR_SECRET_NAME',
      batchSize: 100,
      maxRetries: 3,
      retryDelay: 1000
    })
  );
}
```
