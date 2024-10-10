<!-- START_INFOCARD -->

# AI-Powered PDF Report Generator

**Automatically generate and upload AI-analyzed PDF reports from Flatfile data**

The `AI-Powered PDF Report Generator` is a Flatfile Listener plugin that creates comprehensive PDF reports with AI-driven analysis when a job is ready. It fetches sheet data, utilizes Anthropic's AI for in-depth analysis, generates a visually appealing PDF report, and seamlessly uploads it back to Flatfile.

**Event Type:**
`listener.on('job:ready')`

**Supported field types:**
All field types are supported as the plugin processes entire sheets.

<!-- END_INFOCARD -->

## Features

- Automatic PDF report generation when a job is ready
- AI-powered data analysis using Anthropic's Claude model
- Dynamic PDF creation with data summaries and placeholders for charts
- Seamless upload of generated reports back to Flatfile
- Error handling and logging for robust operation

## Installation

1. Install the required dependencies:

```bash
npm install @flatfile/listener @flatfile/api pdf-lib @anthropic-ai/sdk
```

2. Set up the necessary environment variables:

```
FLATFILE_API_KEY=your_flatfile_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
FLATFILE_SPACE_ID=your_flatfile_space_id
FLATFILE_ENVIRONMENT_ID=your_flatfile_environment_id
```

3. Import and use the plugin in your Flatfile configuration.

## Example Usage

```javascript
import listener from './path-to-plugin';

// Use the listener in your Flatfile configuration
export default {
  name: "My Flatfile Project",
  plugins: [listener],
  // ... other configuration options
};
```

## Configuration

The plugin requires the following environment variables to be set:

- `FLATFILE_API_KEY`: Your Flatfile API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `FLATFILE_SPACE_ID`: The ID of your Flatfile space
- `FLATFILE_ENVIRONMENT_ID`: The ID of your Flatfile environment

Ensure these are properly set in your environment before running the plugin.

## Behavior

1. When a `job:ready` event is triggered, the plugin fetches the sheet data from Flatfile.
2. It then sends the first 10 rows of data to Anthropic's AI for analysis.
3. A PDF report is generated, including:
   - A title
   - A summary of the total records
   - A placeholder for charts or graphs
   - The AI-generated analysis
4. The PDF is temporarily saved and then uploaded back to Flatfile.
5. The temporary PDF file is deleted after successful upload.

In case of any errors during this process, they are logged, and the job is marked as failed with an error message.

This plugin provides a powerful way to automatically generate insightful reports from your Flatfile data, enhancing data analysis and visualization capabilities.