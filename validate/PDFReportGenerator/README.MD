<!-- START_INFOCARD -->

# Flatfile PDF Report Generator

**A Flatfile Listener plugin for generating customizable PDF reports from contact data**

The `Flatfile PDF Report Generator` plugin enhances Flatfile's capabilities by providing a custom action to generate professional PDF reports from contact data. It includes email validation, customizable styling options, and seamless integration with Flatfile's file upload system.

**Event Type:**
`listener.on('action:custom')`

**Supported field types:**
`string`, `email`

<!-- END_INFOCARD -->

## Features

- Email validation for contact records
- Customizable PDF report generation
- Dynamic content including titles, summaries, and placeholders for charts
- Flexible styling options for fonts, colors, and layout
- Automatic PDF upload to Flatfile

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-export-pdf
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import pdfReportGenerator from "@flatfile/plugin-export-pdf";

const listener = new FlatfileListener();

listener.use(pdfReportGenerator);

// Your other listener configurations...
```

## Configuration

The PDF report generator can be customized using the following options:

```javascript
const customStyle = {
  primaryColor: rgb(0.2, 0.4, 0.6),
  secondaryColor: rgb(0.7, 0.7, 0.7),
  fontFamily: StandardFonts.TimesRoman,
  fontSize: {
    title: 28,
    heading: 20,
    subheading: 16,
    body: 14,
  },
  margins: {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60,
  },
};

// Pass the custom style when triggering the action
await api.actions.create({
  operation: "generate_pdf",
  payload: { style: customStyle },
  // other action parameters...
});
```

## Behavior

1. **Email Validation**: The plugin includes a record hook that validates email addresses in the "contacts" sheet. Invalid email addresses will be flagged with an error message.

2. **PDF Generation**: When the custom action "generate_pdf" is triggered, the plugin creates a PDF document with the following sections:
   - Title and generation date
   - Summary (placeholders for total contacts and valid emails)
   - Chart placeholder
   - Contact list placeholder

3. **Styling**: The PDF can be styled using custom colors, fonts, and layout options. If no custom style is provided, default styles will be applied.

4. **File Upload**: After generating the PDF, the plugin automatically uploads it to Flatfile using the provided space and environment IDs.

5. **Error Handling**: The plugin includes error handling for both the PDF generation and upload processes, providing appropriate feedback through event replies.
