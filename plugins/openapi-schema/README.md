<!-- START_INFOCARD -->

The `@flatfile/plugin-convert-openapi-schema` plugin will automatically convert Open
API to the Flatfile Blueprint, a powerful DDL (Data Definition Language)
created by Flatfile with a focus on validation and data preparation.

**Event Type:**
`listener.on('space:configure')`

<!-- END_INFOCARD -->


> This plugin adheres to and is structured around OpenAPI version 3.0.3. Please contact our support team if you encounter compatibility issues with your OpenAPI version.


> When embedding Flatfile, this plugin should be deployed in a server-side listener. [Learn more](/docs/orchestration/listeners#listener-types)



## Parameters

#### `setupFactory` - `OpenAPISetupFactory` - (required)
The `setupFactory` parameter holds the Workbook and Sheet configuration options and OpenAPI source.  

#### `callback` - `function`
The `callback` parameter receives three arguments: `event`, `workbookIds`, and
a `tick` function. The `tick` function can be used to update the Job's
progress. The `callback` function is invoked once the Space and Workbooks are
fully configured.



## API Calls

- `api.spaces.update`
- `api.workbooks.create`



## Usage

The @flatfile/plugin-convert-openapi-schema plugin simplifies the setup of new Flatfile Spaces by configuring the Space from a provided OpenAPI schema.
Designed for server-side listeners, it auto-configures the Space using the supplied settings.

#### Install

```bash install
npm i @flatfile/plugin-convert-openapi-schema
```

#### Import

```js import
import { configureSpaceWithOpenAPI } from "@flatfile/plugin-convert-openapi-schema";
```

#### `listener.js`

```js listener.js
listener.use(
  configureSpaceWithOpenAPI({
    workbooks: [
      {
        source:
          "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.1/webhook-example.json",
        sheets: [{ name: "Favorite Pets", model: "Pet" }],
      },
    ],
    debug: true,
  })
);
```

## Full Example

#### listener.js

```js listener.js
import api, { Flatfile } from "@flatfile/api";
import type { FlatfileListener } from "@flatfile/listener";
import { configureSpaceWithOpenAPI } from "@flatfile/plugin-convert-openapi-schema";

export default async function (listener: FlatfileListener) {
  const workbookActions: Flatfile.Action[] = [
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Submit data",
      type: "string",
      description: "Submit this data to a webhook.",
      primary: true,
    },
    {
      operation: "downloadWorkbook",
      mode: "foreground",
      label: "Download Workbook",
      description: "Downloads Excel Workbook of Data",
    },
  ];
  const sheetActions: Flatfile.Action[] = [
    {
      operation: "duplicateSheet",
      mode: "foreground",
      label: "Duplicate",
      description: "Duplicate this sheet.",
      primary: true,
    },
  ];
  const sheets = [
    {
      model: "AccountingAttachmentResponse",
      slug: "accountingAttachmentResponse",
    },
    { model: "Account", actions: sheetActions },
    {
      model: "Address",
      slug: "addresses",
      name: "Addresses",
      actions: sheetActions,
    },
    { model: "Attachment", slug: "attachments" },
    { model: "BalanceSheet", slug: "balanceSheets" },
    { model: "CashFlowStatement", slug: "cashFlowStatements" },
    { model: "CompanyInfo", slug: "companyInfo" },
    { model: "CreditNote", slug: "creditNotes" },
    { model: "Expense", slug: "expenses" },
    { model: "IncomeStatement", slug: "incomeStatements" },
    { model: "Invoice", slug: "invoices" },
    { model: "Item", slug: "items" },
    { model: "JournalEntry", slug: "journalEntries" },
    { model: "Payment", slug: "payments" },
    { model: "PhoneNumber", slug: "phoneNumbers" },
    { model: "PurchaseOrder", slug: "purchaseOrders" },
    { model: "TaxRate", slug: "taxRates" },
    { model: "TrackingCategory", slug: "trackingCategories" },
    { model: "Transaction", slug: "transactions" },
    { model: "VendorCredit", slug: "vendorCredits" },
  ];

  const callback = async (event, workbookIds, tick) => {
    const { spaceId } = event.context;
    await api.documents.create(spaceId, {
      title: "Welcome",
      body: `<div>
        <h1>Welcome!</h1>
        <h2>To get started, follow these steps:</h2>
        <h2>1. Step One</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <h3>Remember, if you need any assistance, you can always refer back to this page by clicking "Welcome" in the left-hand sidebar!</h3>
        </div>`,
    });
    await tick(80, "Document created");
  };

  listener.namespace(
    ["space:OpenAPI-advanced"],
    configureSpaceWithOpenAPI(
      {
        workbooks: [
          {
            source: "https://api.merge.dev/api/accounting/v1/schema",
            sheets,
            actions: workbookActions,
          },
        ],
      },
      callback
    )
  );
}
```
