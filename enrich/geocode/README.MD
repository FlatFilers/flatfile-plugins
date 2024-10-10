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

## Installation

To install the plugin, use npm:

```bash
npm install @flatfile/plugin-enrich-geocode
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import enrichGeocode from "@flatfile/plugin-enrich-geocode";

listener.use(
   enrichGeocode(listener, {
   apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
   sheetSlug: 'customer_addresses',
   addressField: 'full_address',
   latitudeField: 'lat',
   longitudeField: 'lng'
   })
);

// ... rest of your Flatfile setup
```

## Configuration

The plugin accepts the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sheetSlug` | string | "addresses" | The slug of the sheet containing address data |
| `addressField` | string | "address" | The field name for the address input |
| `latitudeField` | string | "latitude" | The field name for latitude |
| `longitudeField` | string | "longitude" | The field name for longitude |
| `autoGeocode` | boolean | true | Whether to automatically geocode records |
| `apiKey` | string | "YOUR_API_KEY_HERE" | Your Google Maps API key |

## Behavior

1. The plugin checks for the presence of an address or both latitude and longitude fields.
2. If `autoGeocode` is true:
   - For records with an address, it performs forward geocoding.
   - For records with latitude and longitude, it performs reverse geocoding.
3. The plugin updates the record with:
   - Latitude and longitude (for forward geocoding)
   - Formatted address (for both forward and reverse geocoding)
   - Additional components: country and postal code
4. If geocoding fails or returns no results, appropriate errors are added to the record.
5. The plugin handles API errors and adds descriptive error messages to the record.

Note: Ensure you have a valid Google Maps API key with Geocoding API enabled to use this plugin.
