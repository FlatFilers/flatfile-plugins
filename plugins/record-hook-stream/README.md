<!-- START_INFOCARD -->

The `@flatfile/plugin-record-hook-stream` plugin provides a high-performance streaming interface for processing large datasets in Flatfile. It uses adaptive batch processing and concurrent execution to efficiently handle millions of records without memory issues. This plugin is ideal for processing large files where standard record hooks might encounter performance or memory limitations.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->


## Parameters

#### `sheetSlug` - `string`
The `sheetSlug` parameter is the slug of the sheet you want to listen to.

#### `callback` - `function`
The `callback` parameter takes a function that will be run on batches of records. The function receives an array of `Item` objects and must return an array of `Item` objects.

#### `options.includeMessages` - `boolean` - `default: false` - (optional)
When true, includes existing messages on records when streaming data.

#### `options.includeMetadata` - `boolean` - `default: false` - (optional)
When true, includes record metadata in the stream.

#### `options.debug` - `boolean` - `default: false` - (optional)
The `debug` parameter enables detailed logging of processing progress, batch metrics, and performance statistics.



## Usage

```bash install
npm i @flatfile/plugin-record-hook-stream
```

### Import


```js
import { recordHookStream } from "@flatfile/plugin-record-hook-stream";
import { FlatfileEvent, FlatfileListener } from "@flatfile/listener";
```



Pass `recordHookStream` to a Flatfile data listener and provide a function to run when data is added or updated.


### Listen for data changes

Set up a listener to configure Flatfile and respond to data Events. Then use this plugin to set up a streaming hook that responds to data changes.


#### JavaScript

```js
import { recordHookStream } from "@flatfile/plugin-record-hook-stream";

export default async function (listener) {
  listener.use(
    recordHookStream("my-sheet", (items) => {
      return items.map((item) => {
        // Access record data
        const email = item.get("email");
        
        // Validate and add errors
        if (!email) {
          item.err("email", "Email is required");
        }
        
        // Modify values
        item.set("processed", true);
        
        return item;
      });
    })
  );
}
```


#### TypeScript

```typescript
import { recordHookStream } from "@flatfile/plugin-record-hook-stream";
import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";

export default async function (listener: FlatfileListener) {
  listener.use(
    recordHookStream("my-sheet", (items, event: FlatfileEvent) => {
      return items.map((item) => {
        // Access record data with type safety
        const email = item.get("email") as string;
        
        // Validate and add errors
        if (!email) {
          item.err("email", "Email is required");
        }
        
        // Modify values
        item.set("processed", true);
        
        return item;
      });
    })
  );
}
```



### Additional Options

`recordHookStream` can accept additional options to control streaming behavior and performance.


#### JavaScript

```js
import { recordHookStream } from "@flatfile/plugin-record-hook-stream";

export default async function (listener) {
  listener.use(
    recordHookStream(
      "my-sheet",
      (items) => {
        return items.map((item) => {
          // Process each item
          return item;
        });
      },
      { 
        includeMessages: true,
        includeMetadata: false,
        debug: true 
      }
    )
  );
}
```


#### TypeScript

```typescript
import { recordHookStream } from "@flatfile/plugin-record-hook-stream";
import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";

export default async function (listener: FlatfileListener) {
  listener.use(
    recordHookStream(
      "my-sheet",
      (items, event: FlatfileEvent) => {
        return items.map((item) => {
          // Process each item
          return item;
        });
      },
      { 
        includeMessages: true,
        includeMetadata: false,
        debug: true 
      }
    )
  );
}
```



## Streaming Benefits

The streaming architecture provides several advantages over traditional record hooks:

### Performance Optimization
- **Adaptive batch sizing**: Automatically adjusts batch size (100-500 records) based on processing speed
- **Concurrent processing**: Processes up to 15 batches simultaneously for maximum throughput
- **Memory efficiency**: Uses a simple counter instead of storing record IDs, preventing memory issues with large datasets
- **Chunk processing**: Processes records in chunks of 50 to prevent memory spikes

### Reliability Features
- **Automatic retry logic**: Implements exponential backoff for rate limiting and network errors
- **Progress tracking**: Real-time metrics showing records/second processing speed
- **Error handling**: Robust error handling with configurable retry behavior

### When to Use Stream Processing

Use `recordHookStream` when:
- Processing files with more than 10,000 records
- Dealing with memory constraints on large datasets
- Needing real-time progress updates during processing
- Requiring high throughput for data transformations

Use standard `recordHook` when:
- Processing small datasets (< 10,000 records)
- Needing simple, synchronous processing
- Working with records that require complex inter-record logic


## Item API Reference

The `Item` class provides methods for working with record data:

### Data Access Methods
- `get(key: string)`: Get a field value
- `set(key: string, value: any)`: Set a field value
- `has(key: string)`: Check if a field has a value
- `isEmpty(key: string)`: Check if a field is empty

### Validation Methods
- `err(key: string, message: string)`: Add an error message
- `warn(key: string, message: string)`: Add a warning message
- `info(key: string, message: string)`: Add an info message

### Type Conversion Methods
- `str(key: string)`: Get field as nullable string
- `defStr(key: string)`: Get field as string (never null)
- `bool(key: string)`: Get field as boolean
- `date(key: string)`: Get field as Date

### Utility Methods
- `delete()`: Mark record for deletion
- `isDeleted()`: Check if record is marked for deletion
- `isDirty(key?: string)`: Check if record or field has changes
- `keys()`: Get all field keys


## Example Usage

This example demonstrates a complete implementation with email validation, data transformation, and error handling:


### JavaScript

```js
import { recordHookStream } from "@flatfile/plugin-record-hook-stream";

export default async function (listener) {
  listener.use(
    recordHookStream(
      "contacts",
      (items) => {
        return items.map((item) => {
          // Email validation
          const email = item.get("email");
          if (!email) {
            item.err("email", "Email is required");
          } else {
            const validEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!validEmailAddress.test(email)) {
              item.err("email", "Invalid email address");
            }
          }
          
          // Data transformation
          const firstName = item.str("firstName");
          const lastName = item.str("lastName");
          if (firstName && lastName) {
            item.set("fullName", `${firstName} ${lastName}`);
          }
          
          // Conditional logic
          if (item.bool("isVIP")) {
            item.set("priority", "high");
          }
          
          // Add processing timestamp
          item.set("processedAt", new Date().toISOString());
          
          return item;
        });
      },
      { debug: true }
    )
  );
}
```


### TypeScript

```typescript
import { recordHookStream } from "@flatfile/plugin-record-hook-stream";
import { FlatfileListener, FlatfileEvent } from "@flatfile/listener";

interface ContactRecord {
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isVIP?: boolean;
  priority?: string;
  processedAt?: string;
}

export default async function (listener: FlatfileListener) {
  listener.use(
    recordHookStream(
      "contacts",
      (items, event: FlatfileEvent) => {
        return items.map((item) => {
          // Email validation with type safety
          const email = item.get("email") as string | undefined;
          if (!email) {
            item.err("email", "Email is required");
          } else {
            const validEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!validEmailAddress.test(email)) {
              item.err("email", "Invalid email address");
            }
          }
          
          // Data transformation
          const firstName = item.str("firstName");
          const lastName = item.str("lastName");
          if (firstName && lastName) {
            item.set("fullName", `${firstName} ${lastName}`);
          }
          
          // Conditional logic
          if (item.bool("isVIP")) {
            item.set("priority", "high");
          }
          
          // Add processing timestamp
          item.set("processedAt", new Date().toISOString());
          
          return item;
        });
      },
      { debug: true }
    )
  );
}
```