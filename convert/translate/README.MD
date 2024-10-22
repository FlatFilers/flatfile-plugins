<!-- START_INFOCARD -->
# @flatfile/plugin-convert-translate

The `@flatfile/plugin-convert-translate` plugin enables field translation using the Google Translate API. It supports batch translation, configurable options, and both automatic and manual translation workflows. The plugin creates new fields for translated text and includes error handling.

**Event Type:** 
`record:*`

<!-- END_INFOCARD -->

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

## Parameters

The `convertTranslatePlugin` function accepts a configuration object with the following properties:

- `sourceLanguage` (string): The source language code (e.g., 'en' for English)
- `targetLanguage` (string): The target language code (e.g., 'es' for Spanish)
- `sheetSlug` (string): The slug of the sheet where translation should be applied
- `fieldsToTranslate` (string[]): An array of field names to be translated
- `projectId` (string): Your Google Cloud project ID
- `keyFilename` (string): The path to your Google Cloud service account key file

## Usage

### Installation

To install the plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-convert-translate
```

### Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { translatePlugin } from '@flatfile/plugin-convert-translate';

export default function (listener: FlatfileListener) {
   listener.use(translatePlugin({
      sourceLanguage: 'en',
      targetLanguage: 'es',
      sheetSlug: 'products',
      fieldsToTranslate: ['name', 'description'],
      projectId: 'your-google-cloud-project-id',
      keyFilename: '/path/to/your/google-cloud-key.json'
   }))
}
```