# Anthropic Flatfile Plugin

This plugin integrates Anthropic's AI capabilities with Flatfile, enabling AI-powered data processing and example record generation for your data import workflows.

## Features

- AI-powered record processing using Anthropic's language models
- Automatic analysis of sheet configurations
- AI-generated example records based on sheet structure
- Custom action to generate and add example records to sheets
- Configurable number of example records to generate

## Installation

To install the Anthropic Flatfile Plugin, use npm:

```bash
npm install anthropic-flatfile-plugin
```

## Example Usage

```typescript
import { FlatfileListener } from '@flatfile/listener';
import AnthropicFlatfilePlugin from 'anthropic-flatfile-plugin';

const listener = new FlatfileListener();
const anthropicPlugin = new AnthropicFlatfilePlugin('your-anthropic-api-key');

anthropicPlugin.configureListener(listener);

listener.use(/* other plugins */);

export default listener;
```

## Configuration

The AnthropicFlatfilePlugin constructor accepts two parameters:

1. `anthropicApiKey` (required): Your Anthropic API key
2. `defaultExampleRecordCount` (optional): The default number of example records to generate (default: 5)

```typescript
const anthropicPlugin = new AnthropicFlatfilePlugin('your-anthropic-api-key', 10);
```

## Behavior

1. **Record Processing**: The plugin processes each record in the sheet, using Anthropic AI to analyze the 'fieldName' and storing the result in 'processedField'.

2. **Sheet Configuration Analysis**: When a job is ready, the plugin analyzes the sheet configuration and stores it for later use.

3. **Example Record Generation**: The plugin adds a custom action 'generate-examples' that generates AI-powered example records based on the sheet's structure.

4. **Error Handling**: If any errors occur during AI processing, they are added to the record for review.

To generate example records, trigger the 'generate-examples' action in your Flatfile workflow. You can specify the number of records to generate in the action context, or it will use the default count specified during plugin initialization.