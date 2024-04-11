<!-- START_INFOCARD -->

The `@flatfile/plugin-job-handler` package is a plugin designed to streamline handling Flatfile Jobs, which are a large unit of work performed asynchronously on a resource such as a file, Workbook, or Sheet.

**Event Type:**
`listener.on('job:ready')`

<!-- END_INFOCARD -->

## Parameters

#### `job` - `string` - (required)

The `job` parameter is applied as a filter when listening for `job:ready`.


#### `handler` - `function` - (required)

The `handler` parameter is a callback where you execute your code. It accepts two arguments: `event` and `tick`.

- `event`: Represents the `FlatfileEvent`, giving context to the handler.
- `tick`: A function that can be used to update Job progress. It accepts two parameters:
  - `progress`: A number between 0 and 100 indicating the progress percentage.
  - `message`: An optional descriptive string.

Invoking the `tick` function returns a promise that resolves to a JobResponse object. However, using the `tick` function is optional.


#### `opts.debug` - `boolean` - `default: false`

The `debug` parameter is used to enable debug logging for the plugin.



## Usage

The `jobHandler` plugin manages Flatfile Jobs. It listens for the `job:ready` event and screens it based on the `job` parameter.

When a `job:ready` event occurs:

- The `handler` callback is triggered with the `FlatfileEvent` and an optional `tick` function.
- This `tick` function, if used, updates the Job's progress.
- The `handler` may yield a promise that culminates in a `JobResponse` object, allowing for a customized successful Job status.

#### Install

```bash install
npm i @flatfile/plugin-job-handler
```

#### Import

```js import
import { jobHandler } from "@flatfile/plugin-job-handler";
```

Replace `"domain:operation"` with the domain and operation you want to listen for.


#### `listener.js`

```js listener.js
listener.use(
  jobHandler("domain:operation", async (event, tick) => {
    try {
      // your code here...
      await tick(50, "Halfway there!"); // update Job progress
      // ...continue your code...
      await tick(75, "Three quarters there!"); // update Job progress
      // ...continue your code...
      return {
        outcome: {
          message: "Job complete",
        },
      };
    } catch (error) {
      throw error; // will fail the Job
    }
  })
);
```
