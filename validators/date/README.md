<!-- START_INFOCARD -->

The `@flatfile/plugin-validate-date` plugin provides date format normalization functionality for Flatfile. It detects various date formats and converts them to a specified output format, supporting multiple fields and locales.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->

## Parameters

#### `config.sheetSlug` - `string` - `default: **` - (optional)
The `sheetSlug` parameter is the slug of the sheet to apply the normalizer to. If not provided, it will apply to all sheets.

#### `config.dateFields` - `string[]`
The `dateFields` parameter is an array of field names that contain date values to be normalized.

#### `config.outputFormat` - `string`
The `outputFormat` parameter specifies the desired output format for the normalized dates.

#### `config.includeTime` - `boolean`
The `includeTime` parameter determines whether to include time in the normalized output.

## Usage

```bash install
npm install @flatfile/plugin-validate-date
```

### Import

```js
import { validateDate } from '@flatfile/plugin-validate-date'
```

## Example Usage

This example sets up the date format normalizer for the "contacts" sheet, normalizing the "birthdate" and "registration_date" fields to the "MM/DD/YYYY" format.

```javascript
import { FlatfileListener } from '@flatfile/listener'
import { validateDate } from '@flatfile/plugin-validate-date'

export default function (listener: FlatfileListener) {
  listener.use(
    validateDate({
      sheetSlug: 'contacts',
      dateFields: ['birthdate', 'registration_date'],
      outputFormat: 'MM/DD/YYYY',
      includeTime: false
    })
  )

  // ... rest of your Flatfile listener configuration
}
```
