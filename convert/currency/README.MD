# @flatfile/plugin-convert-currency

This plugin implements a currency converter for Flatfile using the Open Exchange Rates API. It allows automatic conversion of currency amounts in your Flatfile sheets, with support for historical exchange rates.

<!-- START_INFOCARD -->

**Event Type:** `listener.on('commit:created')`

**Supported Field Types:** `string`, `number`

<!-- END_INFOCARD -->

## Features

- Automatic currency conversion based on configurable fields
- Support for historical exchange rates using a date field
- Configurable source and target currencies
- Optional fields for storing exchange rates and conversion dates
- Comprehensive error handling and validation
- Uses the Open Exchange Rates API for up-to-date and historical exchange rates

## Parameters

#### `sheetSlug` - `string` - (required)
The slug of the sheet where the plugin should operate.

#### `sourceCurrency` - `string` - (required)
The source currency code (e.g., "USD").

#### `targetCurrency` - `string` - (required)
The target currency code (e.g., "EUR").

#### `amountField` - `string` - (required)
The field name containing the amount to be converted.

#### `dateField` - `string` - (optional)
The field name containing the date for historical rates.

#### `convertedAmountField` - `string` - (required)
The field name where the converted amount will be stored.

#### `exchangeRateField` - `string` - (optional)
The field name where the exchange rate will be stored.

#### `conversionDateField` - `string` - (optional)
The field name where the conversion date will be stored.

## Usage

**Environment Variables**

Add the following environment variables to your space:

- `OPENEXCHANGERATES_API_KEY` - Your Open Exchange Rates API key

**install**
```bash
npm install @flatfile/plugin-convert-currency
```

**import**
```javascript
import { FlatfileListener } from "@flatfile/listener";
import { currencyConverterPlugin } from "@flatfile/plugin-convert-currency";
```

**listener.js**
```javascript
const listener = new FlatfileListener();

listener.use(
  currencyConverterPlugin({
    sheetSlug: "transactions",
    sourceCurrency: "USD",
    targetCurrency: "EUR",
    amountField: "amount",
    dateField: "transactionDate",
    convertedAmountField: "amountInEUR",
    exchangeRateField: "exchangeRate",
    conversionDateField: "conversionDate",
  })
);
```

## Example

This example sets up a currency conversion plugin for the "transactions" sheet. It will automatically convert amounts from USD to EUR for each record in the sheet.

```javascript
import { FlatfileListener } from "@flatfile/listener";
import { currencyConverterPlugin } from "@flatfile/plugin-convert-currency";

export default function (listener: FlatfileListener) {
  listener.use(
    currencyConverterPlugin({
      sheetSlug: "transactions",
      sourceCurrency: "USD",
      targetCurrency: "EUR",
      amountField: "amount",
      dateField: "transactionDate",
      convertedAmountField: "amountInEUR",
      exchangeRateField: "exchangeRate",
      conversionDateField: "conversionDate",
    })
  );

  listener.on("job:ready", async (event) => {
    const { jobId, workbookId } = event.context;
    await event.actions.updateJob(jobId, {
      status: "complete",
      info: "Currency conversion complete",
    });
  });
}
```

In this example, the plugin will:
1. Validate the configuration upon initialization
2. Process each record in the "transactions" sheet
3. If `autoConvert` is true:
   - Check for a valid amount in the "amount" field
   - Use the date in the "transactionDate" field for historical rates (if present)
   - Call the Open Exchange Rates API to get the exchange rate
   - Calculate the converted amount and store it in the "amountInEUR" field
   - Store the exchange rate in the "exchangeRate" field
   - Store the conversion date in the "conversionDate" field
4. Handle errors and add them to the respective fields or as general errors to the record

The `job:ready` event listener is used to mark the job as complete after the conversion process.

Note: This plugin requires an active subscription to the Open Exchange Rates API.