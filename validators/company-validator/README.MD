<!-- START_INFOCARD -->

# @flatfile/plugin-company-validator
**Validate company information including name, website, address, and EIN.**

The `@flatfile/plugin-company-validator` plugin is a validator that will validate company information including name, website, address, and EIN.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->


The plugin performs the following validations:

1. Company Name: Checks if the name is longer than 1 character
2. Company Website: Validates the website format using a regex pattern
3. Company Address (optional): Uses Google Maps API to verify the address
4. EIN (optional): Verifies the EIN using the EIN Verification API

For each invalid field, the plugin adds an error message to the record. The record is then returned, allowing Flatfile to display the errors to the user.

Note: Address and EIN validations are performed only if the respective configuration options are set to true.


## Parameters

#### `sheetSlug` - `string` - (required)

The `sheetSlug` parameter indicates the slug name of the sheet you want to monitor.

#### `googleMapsApiKey` - `string` - (optional)

The `googleMapsApiKey` parameter allows you to specify your Google Maps API key for address validation.

#### `einVerificationApiKey` - `string` - (optional)

The `einVerificationApiKey` parameter allows you to specify your EIN Verification API key.

#### `validateAddress` - `boolean` - (optional)

The `validateAddress` parameter allows you to specify if the plugin should validate company addresses.

#### `validateEIN` - `boolean` - (optional)

The `validateEIN` parameter allows you to specify if the plugin should validate EINs.


## Usage

**Environment Variables**

Add the following environment variables to your space:

- `GOOGLE_MAPS_API_KEY`
- `EIN_VERIFICATION_API_KEY`

**install**
```bash
npm install @flatfile/plugin-company-validation
```

**import**
```js
import { companyValidationPlugin } from "@flatfile/plugin-company-validation";
```

**listener.js**
```js 
listener.use(companyValidationPlugin({
    sheetSlug: "companies",
    validateAddress: true,
    validateEIN: true,
}));
```
