<!-- START_INFOCARD -->

The `@flatfile/plugin-webhook-event-forwarder` plugin forwards events via webhook for clients to manipulate at their 
endpoints in a language-agnostic way.

**Event Type:**
`listener.on('**')`

<!-- END_INFOCARD -->

## Parameters

#### `url` - `string`

The `url` parameter takes the webhook url where the events will be forwarded.  

#### `callback` - `function`

The `callback` parameter takes a function that will be called with the webhook response and the event object.

#### `options` - `object`

The `options` parameter takes an object with the following properties:

- `debug` - `boolean` - (optional) - Whether to log debug messages.


## Usage

#### Install

```bash install
npm i @flatfile/plugin-webhook-event-forwarder
```


#### Import

```ts import
import { webhookEventForwarder } from "@flatfile/plugin-webhook-event-forwarder";
```

#### `listener.js`

```ts listener.js
listener.use(webhookEventForwarder("https://webhook.site/...", (data, event) => {
  console.log(data, event);
}));
```
