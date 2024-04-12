<!-- START_INFOCARD -->

The `@flatfile/util-file-buffer` utility provides a convenient way to process files and extract their contents using the Flatfile API. It allows you to match specific files based on file extensions or regular expressions and retrieve their contents as a buffer for further processing.

<!-- END_INFOCARD -->

> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)

## Code Breakdown

This code defines the `fileBuffer` utility used in Flatfile Extractor plugins for handling file processing. The utility enables you to intercept file creation events and retrieve file contents as a buffer for subsequent operations. Let's break down the main components of the code:

### **Import Statements**

- The code starts by importing necessary dependencies and modules required for file buffering. These include `FlatfileEvent` and `FlatfileListener` from `@flatfile/listener`, and `api` and `Flatfile` from `@flatfile/api`.

### **fileBuffer Function**

- The `fileBuffer` function is the core of the utility and serves as a middleware function for intercepting file creation events.
- It takes two parameters:
  - `matchFile`: A string or regular expression representing the file extension(s) to match for processing.
  - `callback`: A callback function that receives the file metadata, file buffer, and the Flatfile event.

### **Event Listener**

- Inside the `fileBuffer` function, the provided `listener` is configured to listen for `file:created` events. When a file is created, this event will be triggered.

### **Matching File**

- When a `file:created` event occurs, the utility fetches the corresponding file's metadata using the Flatfile API and checks if the file name matches the specified `matchFile`.
- If `matchFile` is a string, the utility checks if the file name ends with the specified extension.
- If `matchFile` is a regular expression, the utility checks if the file name matches the regular expression.

### **Buffering File Contents**

- If the file matches the specified `matchFile`, the utility proceeds to retrieve the file's contents as a buffer using the `getFileBuffer` function.
- The `getFileBuffer` function downloads the file using the Flatfile API and reads its contents into a buffer.

### **Callback Execution**

- After obtaining the file buffer, the utility invokes the provided `callback` function with the file metadata, buffer, and Flatfile event as parameters.

### **Helper Function**

- The code includes a helper function named `getFileBuffer` responsible for downloading the file and buffering its contents.

## Example Usage

```javascript
import { fileBuffer } from "@flatfile/util-file-buffer";
import api, { Flatfile } from "@flatfile/api";

// Define the callback function to process the file buffer
const processFileBuffer = (
  file: Flatfile.File_,
  buffer: Buffer,
  event: FlatfileEvent
) => {
  // Your file processing logic here...
};

// Register the fileBuffer middleware to intercept file:created events
const fileBufferMiddleware = fileBuffer(".csv", processFileBuffer);
listener.use(fileBufferMiddleware);
```

In this example, the fileBuffer middleware is used to intercept .csv files and pass their contents as buffers to the processFileBuffer function for further processing.
