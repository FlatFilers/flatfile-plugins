# Flatfile to WordPress Exporter

This plugin integrates Flatfile with WordPress, allowing for seamless export of records from Flatfile to WordPress posts. It uses the Flatfile Listener and Record Hook plugin to process records and map them to WordPress post fields.

## Features

- Automatic field mapping from Flatfile to WordPress post fields
- Support for custom fields
- Handling of categories and tags as arrays
- Ability to update existing posts or create new ones
- Error handling and reporting

## Installation

To install this plugin, run the following command:

```bash
npm install @flatfile/listener @flatfile/plugin-record-hook @flatfile/api axios
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import { recordHook } from '@flatfile/plugin-record-hook';
import api from '@flatfile/api';
import axios from 'axios';

const listener = FlatfileListener.create((listener) => {
  listener.use(
    recordHook('contacts', async (record, event) => {
      // ... (code implementation as provided in the original snippet)
    })
  );
});

export default listener;
```

## Configuration

To use this plugin, you need to set up the following in your Flatfile space metadata:

- `wpApiUrl`: The URL of your WordPress API
- `wpApiKey`: Your WordPress API authentication key

These credentials are used to authenticate requests to the WordPress API.

## Behavior

1. The plugin processes each record in the 'contacts' sheet.
2. It maps Flatfile fields to WordPress post fields according to a predefined mapping.
3. Special handling is applied for categories, tags, and custom fields.
4. The plugin checks if a post with the same title already exists in WordPress.
5. If an existing post is found, it updates the post; otherwise, it creates a new post.
6. The WordPress post ID is stored back in the Flatfile record.
7. Any errors during the export process are logged and added to the record.

Note: This plugin assumes that the 'title' field is used as a unique identifier for posts. Adjust this logic if a different field should be used for identifying existing posts.