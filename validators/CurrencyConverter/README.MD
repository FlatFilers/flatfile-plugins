# Flatfile Currency Converter Plugin

This plugin implements a currency converter for Flatfile using the Open Exchange Rates API. It allows automatic conversion of currency amounts in your Flatfile sheets, with support for historical exchange rates.

## Features

- Automatic currency conversion based on configurable fields
- Support for historical exchange rates using a date field
- Configurable source and target currencies
- Optional fields for storing exchange rates and conversion dates
- Comprehensive error handling and validation
- Uses the Open Exchange Rates API for up-to-date and historical exchange rates

## Installation

To install the plugin, run the following command in your project directory:

```bash
npm install @flatfile/plugin-currency-converter
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import currencyConverterPlugin from "@flatfile/plugin-currency-converter";

const listener = new FlatfileListener();

listener.use(
  currencyConverterPlugin({
    apiKey: "your_open_exchange_rates_api_key",
    sheetSlug: "transactions",
    sourceCurrency: "USD",
    targetCurrency: "EUR",
    amountField: "amount",
    dateField: "transactionDate",
    convertedAmountField: "amountInEUR",
    exchangeRateField: "exchangeRate",
    conversionDateField: "conversionDate",
    autoConvert: true
  })
);

export default listener;
```

## Configuration

The plugin accepts the following configuration options:

- `apiKey` (required): Your Open Exchange Rates API key
- `sheetSlug` (required): The slug of the sheet where the plugin should operate
- `sourceCurrency` (required): The source currency code (e.g., "USD")
- `targetCurrency` (required): The target currency code (e.g., "EUR")
- `amountField` (required): The field name containing the amount to be converted
- `dateField` (optional): The field name containing the date for historical rates
- `convertedAmountField` (required): The field name where the converted amount will be stored
- `exchangeRateField` (optional): The field name where the exchange rate will be stored
- `conversionDateField` (optional): The field name where the conversion date will be stored
- `autoConvert` (required): Boolean flag to enable/disable automatic conversion

## Behavior

1. The plugin validates the configuration upon initialization.
2. For each record in the specified sheet:
   - If `autoConvert` is false, the record is returned unchanged.
   - The plugin checks for a valid amount in the `amountField`.
   - If a `dateField` is specified, it uses that date for historical rates.
   - The plugin calls the Open Exchange Rates API to get the exchange rate.
   - It calculates the converted amount and stores it in `convertedAmountField`.
   - If specified, it stores the exchange rate and conversion date in their respective fields.
3. Error handling:
   - Invalid amounts or dates are flagged with errors on the respective fields.
   - API errors (e.g., invalid key, rate limits) are added as general errors to the record.
   - Network errors are also handled and reported on the record.

Note: This plugin requires an active subscription to the Open Exchange Rates API.