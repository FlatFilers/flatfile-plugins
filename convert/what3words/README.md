<!-- START_INFOCARD -->

The `@flatfile/plugin-convert-what3words` plugin provides functionality to convert What3Words addresses to standard addresses and coordinates within Flatfile. It integrates with the official What3Words JavaScript API to perform the conversion and populate the user-specified fields with the results.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->

## Parameters

#### `config.what3wordsField` - `string`
The `what3wordsField` parameter is the name of the field containing the What3Words address.

#### `config.countryField` - `string`
The `countryField` parameter is the name of the field where the country code will be stored.

#### `config.nearestPlaceField` - `string`
The `nearestPlaceField` parameter is the name of the field where the nearest place name will be stored.

#### `config.latField` - `string`
The `latField` parameter is the name of the field where the latitude coordinate will be stored.

#### `config.longField` - `string`
The `longField` parameter is the name of the field where the longitude coordinate will be stored.

#### `config.sheetSlug` - `string` - `default: **` - (optional)
The `sheetSlug` parameter is the slug of the sheet to apply the converter to. If not provided, it will apply to all sheets with a `what3wordsField`.

## Usage

**Environment Variables**

Add the following environment variables to your space:

- `W3W_API_KEY` - Your What3Words API key

**Install**
```bash install
npm install @flatfile/plugin-convert-what3words
```

**Import**
```js
import { convertWhat3words } from '@flatfile/plugin-convert-what3words'
```

**Listener.js**
```js
listener.use(
  convertWhat3words({
    sheetSlug: 'locations',
    what3wordsField: 'what3words',
    countryField: 'country',
    nearestPlaceField: 'nearestPlace',
    latField: 'latitude',
    longField: 'longitude'
  })
)
```

### Example Usage

This example sets up the What3Words converter for the "locations" sheet, converting the "what3words" field to standard address, latitude, and longitude.

```javascript
import { FlatfileListener } from '@flatfile/listener'
import convertWhat3words from '@flatfile/plugin-convert-what3words'

export default function (listener: FlatfileListener) {
  listener.use(
    convertWhat3words({
      sheetSlug: 'locations',
      what3wordsField: 'what3words',
      countryField: 'country',
      nearestPlaceField: 'nearestPlace',
      latField: 'latitude',
      longField: 'longitude'
    })
  )

  // ... rest of your Flatfile listener configuration
}
```
