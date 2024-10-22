<!-- START_INFOCARD -->
# @flatfile/plugin-convert-translate

This Flatfile Listener plugin enables field translation using the Google Translate API. It supports batch translation, configurable options, and both automatic and manual translation workflows. The plugin creates new fields for translated text and includes error handling.

**Event Type:** `listener.on('commit:created')`

**Supported Field Types:** `string`

<!-- END_INFOCARD -->


## Features

- Integrates with Google Translate API for accurate translations
- Supports batch translation for improved performance
- Configurable source and target languages
- Allows selection of specific fields for translation
- Creates new fields for translated content
- Includes error handling and logging

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-convert-translate
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { convertTranslatePlugin } from '@flatfile/plugin-convert-translate';

const listener = new FlatfileListener();

const translationConfig = {
  sourceLanguage: 'en',
  targetLanguage: 'es',
  sheetSlug: 'products',
  fieldsToTranslate: ['name', 'description'],
  projectId: 'your-google-cloud-project-id',
  keyFilename: '/path/to/your/google-cloud-key.json'
};

convertTranslatePlugin(listener, translationConfig);
```

## Configuration

The plugin accepts a configuration object with the following properties:

- `sourceLanguage`: The source language code (e.g., 'en' for English)
- `targetLanguage`: The target language code (e.g., 'es' for Spanish)
- `sheetSlug`: The slug of the sheet where translation should be applied
- `fieldsToTranslate`: An array of field names to be translated
- `projectId`: Your Google Cloud project ID
- `keyFilename`: The path to your Google Cloud service account key file

## Behavior

1. The plugin initializes the Google Translate client with the provided project ID and key file.
2. It checks if the current record belongs to the configured sheet.
3. The plugin identifies the fields to be translated based on the configuration.
4. If auto-translation is enabled:
   - The plugin batches the texts and sends them to the Google Translate API.
   - Translated texts are set in new fields named `{originalField}_{targetLanguage}`.
5. If auto-translation is disabled:
   - The plugin creates empty fields named `{originalField}_{targetLanguage}` for manual input.
6. Error handling is implemented to catch and log any issues during the translation process.

## Google Cloud Setup

To use this plugin, you need to set up a Google Cloud project and enable the Cloud Translation API:

1. Create a Google Cloud project or use an existing one.
2. Enable the Cloud Translation API for your project.
3. Create a service account and download the JSON key file.
4. Provide the project ID and the path to the key file in the plugin configuration.

For detailed instructions on setting up Google Cloud and obtaining credentials, refer to the [Google Cloud documentation](https://cloud.google.com/translate/docs/setup).

Note: Ensure that you keep your Google Cloud credentials secure and do not expose them in public repositories or client-side code.
