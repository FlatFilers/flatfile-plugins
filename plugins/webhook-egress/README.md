<!-- START_INFOCARD -->

The `@flatfile/plugin-webhook-egress` plugin egresses Flatfile Workbooks to a webhook.

**Event Type:**
`listener.on('{jobParam}')` (i.e. `listener.on('workbook:submitActionFg')`)

<!-- END_INFOCARD -->


## Parameters

### `job` *string* (required)

The `job` parameter takes the job name.  


### `webhookUrl` *string*

The `webhookUrl` parameter takes the webhook url.  


## Usage

The `webhookEgress` plugin creates an action that will export workbook data via a webhook.
It requires an operation parameter which specifies the event that will initiate the egress. The
webhook url can either be passed in as a parameter or set as an environment variable `WEBHOOK_SITE_URL`.

### Install

```bash install
npm i @flatfile/plugin-webhook-egress
```

### Import

```ts import
import { webhookEgress } from "@flatfile/plugin-webhook-egress";
```


![workbook_actions_primary](https://github.com/FlatFilers/Guides/assets/19697744/c747495a-19e9-4333-88f3-e94239cfe47b)



### `workbook.config.json`

```ts workbook.config.json
  // ... inside Workbook configuration
  "actions": [
    {
      operation: 'submitActionFg',
      mode: 'foreground',
      label: 'Send to...',
      type: 'string',
      description: 'Submit this data to a webhook.',
      primary: true,
    }
  ]
  // ...
```

### `listener.js`

```ts listener.js
// Using the WEBHOOK_SITE_URL environment variable
listener.use(webhookEgress("workbook:submitActionFg"));

// Passing the webhook url as a parameter
listener.use(webhookEgress("workbook:submitActionFg", "https://webhook.site/...""));
```
