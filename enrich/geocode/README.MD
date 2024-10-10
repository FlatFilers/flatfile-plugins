<!-- START_INFOCARD -->
# @flatfile/plugin-enrich-geocode

The `@flatfile/plugin-enrich-geocode` plugin for geocoding addresses using the Google Maps Geocoding API. This plugin enables automatic geocoding of addresses, reverse geocoding of coordinates, and enrichment of location data within your Flatfile imports.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->

## Features

- Forward geocoding: Convert addresses to latitude and longitude coordinates
- Reverse geocoding: Convert latitude and longitude coordinates to formatted addresses
- Automatic geocoding based on available data
- Customizable field mapping
- Error handling for invalid inputs and API errors
- Extraction of additional location components (country, postal code)

## Parameters

The `enrichGeocode` function accepts a configuration object with the following properties:

- `sheetSlug` (string): The slug of the sheet containing address data. Default: "addresses"
- `addressField` (string): The field name for the address input. Default: "address"
- `latitudeField` (string): The field name for latitude. Default: "latitude"
- `longitudeField` (string): The field name for longitude. Default: "longitude"
- `autoGeocode` (boolean): Whether to automatically geocode records. Default: true

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-enrich-geocode
```

## Example Usage

```javascript
import type { FlatfileListener } from "@flatfile/listener";
import enrichGeocode from "@flatfile/plugin-enrich-geocode";

export default function (listener: FlatfileListener) {
   listener.use(
      enrichGeocode(listener, {
         sheetSlug: 'customer_addresses',
         addressField: 'full_address',
         latitudeField: 'lat',
         longitudeField: 'lng'
      })
   );

   // ... rest of your Flatfile setup
}
```
