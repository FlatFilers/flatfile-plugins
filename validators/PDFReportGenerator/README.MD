# Flatfile PDF Generator Plugin

A Flatfile Listener plugin for generating customizable PDF reports from workbook data, with additional features like email validation and file upload functionality.

## Features

- Automatic PDF generation when a job is ready
- Manual PDF generation through custom action
- Customizable PDF styling (font, colors, chart type, etc.)
- Data summary and table generation in PDF
- Chart generation and inclusion in PDF
- Email validation for records
- File upload functionality to Flatfile
- Integration with Flatfile API for data retrieval

## Installation

To install the plugin, run the following command:

```bash
npm install flatfile-pdf-generator-plugin
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import pdfGeneratorPlugin from "flatfile-pdf-generator-plugin";

const listener = new FlatfileListener();
listener.use(pdfGeneratorPlugin);
```

## Configuration

The PDF generation can be customized with the following options:

```javascript
const options = {
  fontSize: 12,
  fontName: 'helvetica',
  textColor: '#000000',
  headerColor: '#4a86e8',
  tableHeaderColor: '#c9daf8',
  chartType: 'bar',
  pageSize: 'a4',
  orientation: 'portrait'
};

// Pass these options when calling generatePDF function
await generatePDF(workbookId, data, options);
```

## Behavior

1. **Automatic PDF Generation**: When a job is ready (`job:ready` event), the plugin automatically generates a PDF report for the associated workbook.

2. **Manual PDF Generation**: A custom action `generatePDF` can be triggered to manually generate a PDF for a specific workbook.

3. **Email Validation**: The plugin includes a record hook that validates email addresses in the "email" field of records.

4. **File Upload**: When a file is created (`file:created` event), the plugin attempts to upload it to Flatfile using the provided API.

5. **Data Retrieval**: The plugin fetches workbook data from Flatfile using the API to generate the PDF report.

6. **PDF Content**: The generated PDF includes:
   - Workbook ID and generation date
   - Data summary
   - Table of data
   - Chart visualization of data

7. **Error Handling**: The plugin includes error handling and logging for various operations.

Note: Ensure you have the necessary permissions and API access to use all features of this plugin.