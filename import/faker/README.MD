<!-- START_INFOCARD -->

The `@flatfile/plugin-import-faker` plugin generates example records using Faker.js. It provides an efficient and flexible way to create large numbers of realistic sample records based on your sheet configuration.

**Event Type:** 
`job:ready`

<!-- END_INFOCARD -->

## Features

- Generates example records for various field types (string, number, boolean, date, enum, reference, array)
- Contextual data generation based on field labels (e.g., names, emails, addresses)
- Efficient batch processing for large record sets
- Progress updates during record generation
- Customizable locale and batch size
- Error handling for unsupported field types or configurations
- Respects field constraints (min, max, unique)

## Parameters

The `fakerImport` function accepts a configuration object with the following properties:

- `job` (string): The operation name to listen for in the job:ready event.
- `count` (number): The number of records to generate (default: 1000).
- `batchSize` (number): The number of records to generate in each batch (default: 1000).

## Usage

### Installation

To install the plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-import-faker
```

### Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { fakerPlugin } from '@flatfile/plugin-import-faker';

export default function (listener: FlatfileListener) {
  listener.use(fakerPlugin({ job: 'sheet:generateExampleRecords' }))
}
```
