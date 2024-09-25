# Flatfile Static Site Generator Plugin

This Flatfile Listener plugin implements a static site generator that processes imported data, generates static pages, and provides options for different static site generators, styling, and interactivity. It seamlessly integrates with Flatfile's data import capabilities to create customizable static websites.

## Features

- Automatic data processing and transformation
- Support for multiple static site generators (e.g., Gatsby)
- Customizable templates and styling options
- Interactive features like search and sorting
- Sitemap generation
- SEO metadata creation
- Data visualization capabilities
- Responsive design
- Export functionality for generated static sites

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-static-site-generator
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener';
import staticSiteGenerator from '@flatfile/plugin-static-site-generator';

const listener = FlatfileListener.create((client) => {
  client.use(staticSiteGenerator());

  // ... other configurations
});

export default listener;
```

## Configuration

The plugin can be configured with the following options:

```javascript
client.use(staticSiteGenerator({
  generator: 'gatsby',
  template: 'default',
  styling: 'minimal',
  interactivity: ['search', 'sort'],
  exportJobName: 'Export for Static Site Generation',
  autoDownload: true
}));
```

- `generator`: The static site generator to use (default: 'gatsby')
- `template`: The template style for the generated site (default: 'default')
- `styling`: The styling option for the site (default: 'minimal')
- `interactivity`: An array of interactive features to include (default: ['search', 'sort'])
- `exportJobName`: The name of the export job (default: 'Export for Static Site Generation')
- `autoDownload`: Whether to automatically download the generated site (default: true)

## Behavior

1. The plugin processes imported data using Flatfile's data processing capabilities.
2. It then generates a static site based on the processed data and user-defined configurations.
3. The generated site includes:
   - HTML pages for each data entry
   - A sitemap for improved SEO
   - SEO metadata for each page
   - Interactive features like search and sorting (if configured)
   - Data visualizations (if applicable)
4. The generated site is packaged into a zip file and uploaded to Flatfile.
5. If `autoDownload` is set to true, the generated site will be automatically downloaded.

The plugin integrates seamlessly with other Flatfile features like data validation, transformation, and export functionality.