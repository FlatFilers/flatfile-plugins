<!-- START_INFOCARD -->

The `@flatfile/util-extractor` utility is designed to handle various file formats and extract structured data efficiently. It leverages the power of the Flatfile API to facilitate smooth data extraction and processing.

<!-- END_INFOCARD -->


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)


## Code Breakdown

This code defines a shared utility used in Flatfile Extractor plugins for data extraction. The purpose of this utility is to process files and extract structured data from them using the Flatfile API. It leverages various Flatfile SDK components and utilities ([@flatfile/util-file-buffer](/docs/plugins-docs/utils/file-buffer) to perform the data extraction process efficiently. Let's break down the main components of the code:

### **Import Statements**

- The code starts by importing various dependencies and modules required for data extraction. These include `FlatfileListener` from `@flatfile/listener`, `fileBuffer` from `@flatfile/util-file-buffer`, `api` and `Flatfile` from `@flatfile/api`, and `mapValues` from `remeda`.

### **Extractor Function**

- The `Extractor` function is the main entry point of the utility. It takes three parameters:
  - `fileExt`: A string or regular expression representing the file extension(s) to be processed.
  - `parseBuffer`: A callback function that processes the file buffer and returns a `WorkbookCapture`.
  - `options`: An optional object containing additional configuration options for data extraction.
    - `options.chunkSize`: Specifies the quantity of Records per chunk. Default value is `10_000`.
    - `options.parallel`: Determines how many chunks are processed simultaneously. Default value is `1`.
- Inside the `Extractor` function, a FlatfileListener is used to intercept files with the specified extensions and perform the extraction process.

### **Extraction Process**

- When a file with the specified extension is received, the extraction process begins. The utility creates a job using the Flatfile API to track the extraction progress.
- The `parseBuffer` function is then called to extract data from the file buffer using the provided options.
- A workbook is created based on the extracted data using the `createWorkbook` function. The workbook is then updated with sheets containing the extracted data.

### **Helper Functions**

- The code includes several helper functions to assist in the extraction process:
  - `createWorkbook`: Creates a Flatfile workbook based on the extracted data.
  - `getWorkbookConfig`: Generates the configuration for the workbook, including sheet names, fields, and constraints.
  - `getSheetConfig`: Generates the configuration for each sheet, including field names, labels, and constraints.
  - `asyncBatch`: A utility function that processes data in chunks asynchronously to improve performance.

### **Type Definitions**

- The code defines two generic type structures: `WorkbookCapture` and `SheetCapture`. These types represent the structure of captured workbooks and sheets.

