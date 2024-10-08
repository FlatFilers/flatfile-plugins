# Flatfile Email Validation Plugin

A Flatfile Listener plugin for comprehensive email validation. This plugin enhances data quality by validating email fields in your Flatfile sheets, ensuring that email addresses are properly formatted, not from disposable domains, and optionally verifying domain existence.

## Features

- Email format validation using regex
- Disposable email domain check
- Optional DNS lookup for domain validation (in non-production environments)
- Configurable error messages
- Automatic validation with options to customize behavior

## Installation

```bash
npm install @flatfile/plugin-email-validation
```

## Example Usage

```javascript
import { FlatfileListener } from "@flatfile/listener";
import emailValidationPlugin from "@flatfile/plugin-email-validation";

const listener = new FlatfileListener();

listener.use(
  emailValidationPlugin({
    sheetSlug: "contacts",
    emailFields: ["email", "alternativeEmail"],
    automaticValidation: true,
    errorMessages: {
      required: "Please provide an email address",
      invalid: "The email address is not valid",
      disposable: "Disposable email addresses are not allowed",
      domain: "The email domain is invalid"
    }
  })
);

listener.subscribe((event) => {
  // Your event handling logic here
});
```

## Configuration

The plugin accepts a configuration object with the following properties:

- `sheetSlug` (string): The slug of the sheet to apply the validation to
- `emailFields` (string[]): An array of field names to validate as email addresses
- `automaticValidation` (boolean): Whether to automatically validate emails on record creation/update
- `errorMessages` (object, optional): Custom error messages for different validation scenarios
  - `required` (string): Message for missing email
  - `invalid` (string): Message for invalid email format
  - `disposable` (string): Message for disposable email domains
  - `domain` (string): Message for invalid or non-existent domains

## Behavior

1. The plugin checks if the email field is empty and adds an error if it's required.
2. It validates the email format using a regex pattern.
3. It checks if the email domain is in a list of known disposable email domains.
4. In non-production environments, it performs a DNS lookup to verify the domain's existence.
5. For each validation step, if an error is found, it adds the appropriate error message to the record.

Note: DNS lookup for domain validation is only performed in non-production environments to avoid potential performance issues in production.