<!-- START_INFOCARD -->
# @flatfile/plugin-validate-phone

The `@flatfile/plugin-validate-phone` plugin offers a convenient way to 
validate phone numbers. By setting up an event listener for the `commit:created` 
event, this plugin seamlessly integrates with the data processing flow. This
plugins supports phone number formatting for multiple countries (US, UK, India, 
Germany, France, and Brazil).

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->

## Parameters

#### `config.sheetSlug` - `string` - `default: **` - (optional)
The `sheetSlug` parameter is the slug of the sheet you want to listen to. By default it listens to commits in all sheets.

#### `config.phoneField` - `string`
The `phoneField` parameter is the phone field's name.

#### `config.countryField` - `string`
The `countryField` parameter is the country field's name.

#### `config.autoConvert` - `boolean` - `default: true` - (optional)
The `autoConvert` parameter allows you to specify whether the field's format will automatically be converted.

#### `config.concurrency` - `number` - `default: 10` - (optional)
The `concurrency` parameter allows you to specify the number of records to process concurrently.

#### `config.debug` - `boolean` - `default: false` - (optional)
The `debug` parameter allows you to turn on debug logging.

#### `config.format` - `NumberFormat` - `default: 'NATIONAL'` - (optional)
The `format` parameter specifies the desired output format for the phone number. Options include 'NATIONAL', 'INTERNATIONAL', 'E164', 'RFC3966', and 'SIGNIFICANT'.

#### `config.formatOptions` - `FormatNumberOptions` - (optional)
The `formatOptions` parameter allows you to pass additional formatting options as defined by the `libphonenumber-js` library.

## Usage

```bash
npm install @flatfile/plugin-validate-phone
```

### Import

```js
import validatePhone from '@flatfile/plugin-validate-phone';
```

## Example Usage

This example sets up a record hook using `listener.use` to validate and format phone numbers in the "my-sheet" sheet which contains a phone number field called `phone_number` and a country field called `country_code`.

```javascript
import { FlatfileListener } from '@flatfile/listener';
import validatePhone from '@flatfile/plugin-validate-phone';

export default function (listener: FlatfileListener) {
  listener.use(validatePhone({
    sheetSlug: 'my-sheet',
    phoneField: 'phone_number',
    countryField: 'country_code',
    autoConvert: true,
    format: 'INTERNATIONAL',
    formatOptions: { formatExtension: 'national' }
  }));

  // ... rest of your Flatfile listener
}
```
