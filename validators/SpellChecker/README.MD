# Flatfile Spell Check Plugin

A powerful spell-checking plugin for Flatfile that enhances data quality by identifying and optionally correcting misspellings in specified fields.

## Features

- Customizable field selection for spell-checking
- Support for multiple languages
- Custom dictionary and affix file support
- Automatic spell correction option
- Highlighted misspellings in original text
- Spell-check suggestions for misspelled words
- Separate fields for highlighted text, suggestions, and corrected text

## Installation

To install the Flatfile Spell Check Plugin, use npm:

```bash
npm install @flatfile/plugin-spellcheck
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import spellCheckPlugin from "@flatfile/plugin-spellcheck";

const listener = new FlatfileListener();

spellCheckPlugin(listener, {
  fields: ["name", "description"],
  language: "en_US",
  sheetSlug: "contacts",
  autoCorrect: false
});

listener.use(/* ... other plugins ... */);
```

## Configuration

The spell check plugin accepts the following configuration options:

- `fields`: Array of field names to spell-check (default: `["name", "description", "comments"]`)
- `dictionaryPath`: Custom path to dictionary file
- `affixPath`: Custom path to affix file
- `language`: Language code for built-in dictionaries (default: `"en_US"`)
- `sheetSlug`: Sheet slug to apply the spell check to (default: `"mySheetSlug"`)
- `autoCorrect`: Whether to automatically apply corrections (default: `false`)

## Behavior

1. The plugin processes each record in the specified sheet.
2. For each configured field, it splits the text into words and checks for misspellings.
3. If misspellings are found:
   - A warning is added to the field
   - A new field is created with highlighted misspellings
   - Another field is created with spell-check suggestions
   - A field with the list of misspelled words is added
   - If `autoCorrect` is true, the original field is updated with corrections
   - If `autoCorrect` is false, a new field with suggested corrections is created
4. The plugin uses a concurrency of 5 and includes debug information.

This plugin helps improve data quality by identifying potential spelling errors and providing suggestions or automatic corrections, depending on the configuration.