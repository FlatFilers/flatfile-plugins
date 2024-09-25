# Flatfile PDF Report Generator Plugin

This plugin implements a custom action in Flatfile to generate PDF reports using the pdfkit library. It allows users to create customizable reports with dynamic data, charts, and styling options. The generated PDF is then uploaded to Flatfile using the @flatfile/api.

## Features

- Generate PDF reports from Flatfile sheet data
- Customizable report templates
- Dynamic content insertion
- Table generation from sheet data
- Chart generation using Chart.js
- Customizable styling options
- Automatic upload of generated PDFs to Flatfile

## Installation

```bash
npm install @flatfile/listener @flatfile/plugin-space-configure pdfkit chartjs-node-canvas @flatfile/api
```

## Example Usage

```javascript
import { FlatfileListener } from '@flatfile/listener'
import { configureSpace } from '@flatfile/plugin-space-configure'
import pdfReportGenerator from './pdfReportGenerator'

const listener = FlatfileListener.create((client) => {
  configureSpace(client)
  pdfReportGenerator(client)
})

export default listener
```

## Configuration

The PDF report generator can be configured using a payload when triggering the action:

```javascript
{
  workbookId: 'your-workbook-id',
  sheetId: 'your-sheet-id',
  reportTemplate: {
    title: 'Your Report Title',
    sections: [
      {
        title: 'Section 1',
        type: 'table',
        columns: ['column1', 'column2'],
        options: { /* table options */ }
      },
      {
        title: 'Section 2',
        type: 'text',
        content: 'Dynamic content: {fieldName}'
      },
      {
        title: 'Section 3',
        type: 'chart',
        chartId: 'yourChartId',
        options: { /* chart options */ }
      }
    ]
  },
  chartData: {
    yourChartId: { /* Chart.js configuration */ }
  },
  styling: {
    documentOptions: { /* PDFDocument options */ },
    font: 'path/to/font.ttf',
    fontSize: 12
  }
}
```

## Behavior

1. The plugin listens for the `action:generatePDFReport` event.
2. When triggered, it fetches data from the specified sheet.
3. It generates a PDF based on the provided template, data, and styling options.
4. Charts are generated using Chart.js if chart data is provided.
5. The generated PDF is uploaded to Flatfile and associated with the workbook.
6. The action returns the outcome with a success message and file details.