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

#### `config.autoConvert` - `boolean` - `default: false` - (optional)
The `autoConvert` parameter allows you to specify whether the field's format will automatically be converted.

#### `config.concurrency` - `number` - `default: 10` - (optional)
The `concurrency` parameter allows you to specify the number of records to process concurrently.

#### `config.debug` - `boolean` - `default: false` - (optional)
The `debug` parameter allows you to turn on debug logging.




## Usage

```bash install
npm install @flatfile/plugin-phone-format
```

### Import

```js
import phoneFormatPlugin from '@flatfile/plugin-phone-format';
```

## Example Usage

This example sets up a record hook using `listener.use` to modify records in the "my-sheet" sheet which contains a phone number fields called `phone_number` and a country field called `country_code`.

```javascript
import { FlatfileListener } from '@flatfile/listener';
import phoneFormatPlugin from '@flatfile/plugin-phone-format';

export default function (listener: FlatfileListener) {
  listener.use(phoneFormatPlugin({
    sheetSlug: 'my-sheet',
    phoneField: 'phone_number',
    countryField: 'country_code',
    autoConvert: true
  }));

  // ... rest of your Flatfile listener
}
```
