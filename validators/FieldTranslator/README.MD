# Flatfile Field Translation Plugin

This Flatfile Listener plugin enables field translation using the Google Translate API. It supports batch translation, configurable options, and both automatic and manual translation workflows. The plugin creates new fields for translated text and includes error handling.

## Features

- Integrates with Google Translate API for accurate translations
- Supports batch translation for improved performance
- Configurable source and target languages
- Allows selection of specific fields for translation
- Creates new fields for translated content
- Supports both automatic and manual translation workflows
- Includes error handling and logging

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-field-translation
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import flatfileListenerPlugin from '@flatfile/plugin-field-translation';

const listener = new FlatfileListener();

const translationConfig = {
  sourceLanguage: 'en',
  targetLanguage: 'es',
  sheetSlug: 'products',
  fieldsToTranslate: ['name', 'description'],
  autoTranslate: true
};

flatfileListenerPlugin(listener, translationConfig);
```

## Configuration

The plugin accepts a configuration object with the following properties:

- `sourceLanguage`: The source language code (e.g., 'en' for English)
- `targetLanguage`: The target language code (e.g., 'es' for Spanish)
- `sheetSlug`: The slug of the sheet where translation should be applied
- `fieldsToTranslate`: An array of field names to be translated
- `autoTranslate`: A boolean indicating whether to perform automatic translation (true) or create empty fields for manual input (false)

## Behavior

1. The plugin checks if the current record belongs to the configured sheet.
2. It identifies the fields to be translated based on the configuration.
3. If auto-translation is enabled:
   - The plugin batches the texts and sends them to the Google Translate API.
   - Translated texts are set in new fields named `{originalField}_{targetLanguage}`.
4. If auto-translation is disabled:
   - The plugin creates empty fields named `{originalField}_{targetLanguage}` for manual input.
5. Error handling is implemented to catch and log any issues during the translation process.

Note: You need to set up Google Cloud credentials and provide the necessary configuration (project ID and key file) to use the Google Translate API.