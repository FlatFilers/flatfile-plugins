# Flatfile WordPress CMS Export Plugin

This Flatfile Listener plugin enables seamless export of data to WordPress CMS. It provides a robust solution for mapping fields, handling custom fields, applying default settings, previewing posts, and batch exporting to WordPress.

## Features

- Field mapping from Flatfile to WordPress post structure
- Custom field handling
- Default settings application
- Post preview generation
- Batch export to WordPress
- WordPress API authentication
- Error handling and reporting

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-wordpress-export
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import WordpressCMSExport from "@flatfile/plugin-wordpress-export";

const listener = new FlatfileListener();
const wordpressExport = WordpressCMSExport(listener);

// Your additional listener configurations...

export default listener;
```

## Configuration

The plugin requires WordPress API credentials to be configured. You can set these in your Flatfile space metadata:

```javascript
await api.spaces.update(workspaceId, {
  metadata: {
    wpConfig: {
      apiUrl: "https://your-wordpress-site.com",
      username: "your-username",
      password: "your-password",
    },
  },
});
```

## Behavior

1. **Field Mapping**: The plugin maps Flatfile fields to WordPress post fields, including title, content, status, date, author, categories, and tags.

2. **Custom Fields**: Any field prefixed with "custom_" in Flatfile will be treated as a custom field in WordPress.

3. **Default Settings**: Default settings for post status, author, categories, and tags are applied if not provided in the Flatfile record.

4. **Post Preview**: A HTML preview of each post is generated before export.

5. **Batch Export**: Posts are exported in batches to the configured WordPress site using the WordPress REST API.

6. **Error Handling**: Any errors during the export process are logged and reported back to Flatfile.

7. **Job Progress**: The plugin updates the job progress in Flatfile, providing real-time feedback on the export process.

8. **Workspace Metadata**: After a successful commit, the plugin updates the workspace metadata to indicate that WordPress configuration is required.

This plugin streamlines the process of exporting data from Flatfile to WordPress, handling the complexities of field mapping, custom fields, and API interactions.