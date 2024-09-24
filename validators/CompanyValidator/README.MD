# Flatfile Company Validation Plugin

This plugin implements a company validation RecordHook for Flatfile. It validates company information including name, website, address, and EIN (Employer Identification Number). The plugin uses external APIs for address validation and EIN verification, providing detailed error messages for unverified information.

## Features

- Validates company name
- Validates company website format
- Validates company address using Google Maps API (optional)
- Validates EIN using EIN Verification API (optional)
- Configurable validation options
- Detailed error messages for invalid data

## Installation

To install the plugin, run the following command:

```bash
npm install @flatfile/plugin-company-validation
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import companyValidationPlugin from "@flatfile/plugin-company-validation";

const listener = new FlatfileListener();

listener.use(
  companyValidationPlugin({
    sheetSlug: "companies",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    einVerificationApiKey: "YOUR_EIN_VERIFICATION_API_KEY",
    validateAddress: true,
    validateEIN: true,
  })
);
```

## Configuration

The plugin accepts a configuration object with the following properties:

- `sheetSlug` (string): The slug of the sheet to apply the validation to
- `googleMapsApiKey` (string): Your Google Maps API key for address validation
- `einVerificationApiKey` (string): Your EIN Verification API key
- `validateAddress` (boolean): Whether to validate company addresses
- `validateEIN` (boolean): Whether to validate EINs

## Behavior

The plugin performs the following validations:

1. Company Name: Checks if the name is longer than 1 character
2. Company Website: Validates the website format using a regex pattern
3. Company Address (optional): Uses Google Maps API to verify the address
4. EIN (optional): Verifies the EIN using the EIN Verification API

For each invalid field, the plugin adds an error message to the record. The record is then returned, allowing Flatfile to display the errors to the user.

Note: Address and EIN validations are performed only if the respective configuration options are set to true.