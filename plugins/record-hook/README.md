<!-- START_INFOCARD -->

The `@flatfile/plugin-record-hook` plugin offers a convenient way to execute
custom logic on individual data records within Flatfile. By setting up an event
listener for the `commit:created` event, this plugin seamlessly integrates with
the data processing flow.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->


## Parameters

#### `sheetSlug` - `string`
The `sheetSlug` parameter is the slug of the sheet you want to listen to.

#### `callback` - `function`
The `callback` parameter takes a function that will be run on the record or records.

#### `options.chunkSize` - `number` - `default: 10_000` - (optional)
The `chunkSize` parameter allows you to specify the quantity of records to process in each chunk.

#### `options.parallel` - `number` - `default: 1` - (optional)
The `parallel` parameter allows you to specify the number of chunks to process in parallel.



## Usage

```bash install
npm i @flatfile/plugin-record-hook @flatfile/hooks
```

### Import


#### bulkRecordHook

```js bulkRecordHook
import { FlatfileRecord, bulkRecordHook } from "@flatfile/plugin-record-hook";
import { FlatfileEvent, FlatfileListener } from "@flatfile/listener";
```

#### recordHook

```js recordHook
import { FlatfileRecord, recordHook } from "@flatfile/plugin-record-hook";
import { FlatfileEvent, FlatfileListener } from "@flatfile/listener";
```



Pass `bulkRecordHook` or `recordHook` to a Flatfile data listener and provide a function to run when data is added or updated.


### Listen for data changes

Set up a listener to configure Flatfile and respond to data Events. Then use this plugin to set up a hook that responds to data changes.


#### JavaScript

**bulkRecordHook.js**

```js bulkRecordHook js
import { bulkRecordHook } from "@flatfile/plugin-record-hook";

export default async function (listener) {
  listener.use(
    bulkRecordHook("my-sheet", (records) => {
      return records.map((r) => {
        //do your work here
        return r;
      });
    })
  );
}
```

**recordHook.js**

```js recordHook js
import { recordHook } from "@flatfile/plugin-record-hook";

export default async function (listener) {
  listener.use(
    recordHook("my-sheet", (record) => {
      //do your work here
      return record;
    })
  );
}
```

#### TypeScript

**bulkRecordHook.ts**

```js bulkRecordHook ts
import { FlatfileRecord } from "@flatfile/hooks";
import { bulkRecordHook } from "@flatfile/plugin-record-hook";
import { FlatfileListener } from "@flatfile/listener";

export default async function (listener: FlatfileListener) {
  listener.use(
    bulkRecordHook("my-sheet", (records: FlatfileRecord[]) => {
      return records.map((r) => {
        //do your work here
        return r;
      });
    })
  );
}
```

**recordHook.ts**

```js recordHook ts
import { FlatfileRecord } from "@flatfile/hooks";
import { recordHook } from "@flatfile/plugin-record-hook";
import { FlatfileListener } from "@flatfile/listener";

export default async function (listener: FlatfileListener) {
  listener.use(
    recordHook("my-sheet", (record: FlatfileRecord) => {
      //do your work here
      return record;
    })
  );
}
```



### Additional Options

`bulkRecordHook` can accept additional properties. Props will be passed along to the transformer.


#### JavaScript

**bulkRecordHook.js**

```js bulkRecordHook js
import { bulkRecordHook } from "@flatfile/plugin-record-hook";

export default async function (listener) {
  listener.use(
    bulkRecordHook("my-sheet", (records) => {
      return records.map((r) => {
        //do your work here
        return r;
      });
    }),
    { chunkSize: 100, parallel: 2 }
  );
}
```


#### TypeScript

**bulkRecordHook.ts**

```js bulkRecordHook ts
import { FlatfileRecord } from "@flatfile/hooks";
import { bulkRecordHook } from "@flatfile/plugin-record-hook";
import { FlatfileListener } from "@flatfile/listener";

export default async function (listener: FlatfileListener) {
  listener.use(
    bulkRecordHook(
      "my-sheet",
      (records: FlatfileRecord[]) => {
        return records.map((r) => {
          //do your work here
          return r;
        });
      },
      { chunkSize: 100, parallel: 2 }
    )
  );
}
```



#### Flexible Options

#### `chunkSize` *number* *default: 10_000* (optional)
Define how many records you want to process in each batch. This allows you to balance efficiency and resource utilization based on your specific use case.

#### `parallel` *number* *default: 1* (optional)
Choose whether the records should be processed in parallel. This enables you to optimize the execution time when dealing with large datasets.


## Example Usage

This example sets up a record hook using `listener.use` to modify records in the "my-sheet" sheet.
in the "my-sheet" sheet.

When a record is processed by the hook, it checks if an email address is missing, empty, or invalid, and if so, it logs corresponding error messages and adds them to a form validation context (if the r object is related to form validation). This helps ensure that only valid email addresses are accepted in the application.

In the `bulkRecordHook` example, it passes a `chunkSize` of 100 and asks the hooks to run 2 at a time via the `parallel` property.


### JavaScript

**bulkRecordHook.js**

```js bulkRecordHook js
import { bulkRecordHook } from "@flatfile/plugin-record-hook";

export default async function (listener) {
  listener.use(
    bulkRecordHook(
      "my-sheet",
      (records) => {
        return records.map((r) => {
          const email = r.get("email") as string;
          if (!email) {
            console.log("Email is required");
            r.addError("email", "Email is required");
          }
          const validEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (email !== null && !validEmailAddress.test(email)) {
            console.log("Invalid email address");
            r.addError("email", "Invalid email address");
          }
          return r;
        });
      },
      { chunkSize: 100, parallel: 2 }
    )
  );
}
```

**recordHook.js**

```js recordHook js
import { recordHook } from "@flatfile/plugin-record-hook";

export default async function (listener) {
  listener.use(
    recordHook(
      "my-sheet",
      (record) => {
        const email = record.get("email") as string;
        if (!email) {
          console.log("Email is required");
          record.addError("email", "Email is required");
        }
        const validEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email !== null && !validEmailAddress.test(email)) {
          console.log("Invalid email address");
          record.addError("email", "Invalid email address");
        }
        return record;
      }
    )
  );
}
```


### TypeScript

**bulkRecordHook.ts**

```js bulkRecordHook ts
import { FlatfileRecord } from "@flatfile/hooks";
import { bulkRecordHook } from "@flatfile/plugin-record-hook";
import { FlatfileListener } from "@flatfile/listener";

export default async function (listener: FlatfileListener) {
  listener.use(
    bulkRecordHook(
      "contacts",
      (records: FlatfileRecord[]) => {
        return records.map((r) => {
          const email = r.get("email") as string;
          if (!email) {
            console.log("Email is required");
            r.addError("email", "Email is required");
          }
          const validEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (email !== null && !validEmailAddress.test(email)) {
            console.log("Invalid email address");
            r.addError("email", "Invalid email address");
          }
          return r;
        });
      },
      { chunkSize: 100, parallel: 2 }
    )
  );
}
```

**recordHook.ts**

```js recordHook ts
import { FlatfileRecord } from "@flatfile/hooks";
import { recordHook } from "@flatfile/plugin-record-hook";
import { FlatfileListener } from "@flatfile/listener";

export default async function (listener: FlatfileListener) {
  listener.use(
    recordHook(
      "contacts",
      (record: FlatfileRecord) => {
        const email = record.get("email") as string;
        if (!email) {
          console.log("Email is required");
          record.addError("email", "Email is required");
        }
        const validEmailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email !== null && !validEmailAddress.test(email)) {
          console.log("Invalid email address");
          record.addError("email", "Invalid email address");
        }
        return record;
      }
    )
  );
}
```
