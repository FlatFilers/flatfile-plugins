# Flatfile Example Records Generator Plugin

This Flatfile Listener plugin generates example records using Faker.js. It provides an efficient and flexible way to create large numbers of realistic sample records based on your sheet configuration.

## Features

- Generates example records for various field types (string, number, boolean, date, enum, reference, array)
- Contextual data generation based on field labels (e.g., names, emails, addresses)
- Efficient batch processing for large record sets
- Progress updates during record generation
- Customizable locale and batch size
- Error handling for unsupported field types or configurations
- Respects field constraints (min, max, unique)

## Installation

To install the plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-record-hook @flatfile/hooks @faker-js/faker
```

## Example Usage

```javascript
import { recordHook } from '@flatfile/plugin-record-hook';
import generateExampleRecords from './generateExampleRecords';

export default function (listener) {
  listener.use(
    recordHook('generateExampleRecords', generateExampleRecords)
  );
}
```

## Configuration

The plugin accepts the following options:

- `count`: Number of records to generate (default: 1000)
- `locale`: Locale for Faker.js (default: 'en')
- `batchSize`: Number of records to generate in each batch (default: 1000)

You can pass these options when triggering the plugin:

```javascript
await client.events.broadcast('generateExampleRecords', {
  count: 5000,
  locale: 'fr',
  batchSize: 500
});
```

## Behavior

1. The plugin reads the sheet configuration from the event.
2. It generates records in batches, respecting the specified count and batch size.
3. For each field, it generates appropriate data based on the field type and label:
   - Strings: Generates names, emails, addresses, or random words based on the label
   - Numbers: Generates ages, prices, or random numbers
   - Booleans: Generates random true/false values
   - Dates: Generates birth dates or recent dates
   - Enums: Selects a random option from the provided list
   - References: Generates a UUID
   - Arrays: Generates an array of strings or numbers
4. It respects field constraints such as min, max, and unique values.
5. The plugin provides progress updates during the generation process.
6. Generated records are added to the sheet in batches.

This plugin is ideal for quickly populating your Flatfile sheets with realistic sample data for testing and demonstration purposes.