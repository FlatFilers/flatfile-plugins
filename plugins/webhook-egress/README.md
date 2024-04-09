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


![workbook_actions_primary](https://github-production-user-asset-6210df.s3.amazonaws.com/19697744/239029887-c747495a-19e9-4333-88f3-e94239cfe47b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240409%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240409T175957Z&X-Amz-Expires=300&X-Amz-Signature=b3193a39e3f8db97bd9f6693d34e26c3a71a92a4e498499391cb74f214d7564b&X-Amz-SignedHeaders=host&actor_id=308142&key_id=0&repo_id=628274084)



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
