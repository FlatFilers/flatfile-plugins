# @flatfile/plugin-anonymize

A Flatfile plugin for anonymizing email addresses by converting them to MD5 hashes. This plugin is useful for protecting personally identifiable information (PII) while maintaining data structure for analysis and testing purposes.

## Features

- **Email Anonymization**: Converts email addresses to MD5 hashes
- **Domain Preservation**: Option to preserve original domains while hashing local parts
- **Salt Support**: Add custom salt for enhanced security
- **Bulk Processing**: Efficiently processes records in batches
- **Error Handling**: Graceful handling of invalid emails and edge cases
- **Debug Mode**: Detailed logging for troubleshooting

## Installation

```bash
npm install @flatfile/plugin-anonymize
```

## Usage

### Basic Usage

```javascript
import { anonymize } from '@flatfile/plugin-anonymize'

// Basic anonymization
listener.use(anonymize({
  sheet: 'contacts',
  field: 'email'
}))
```

### Advanced Usage

```javascript
import { anonymize } from '@flatfile/plugin-anonymize'

// With all options
listener.use(anonymize({
  sheet: 'contacts',
  field: 'email',
  salt: 'my-secret-salt',
  preserveDomain: true,
  debug: true,
  chunkSize: 1000,
  parallel: 5
}))
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sheet` | `string` | **required** | The sheet slug to process |
| `field` | `string` | **required** | The field containing email addresses |
| `salt` | `string` | `''` | Optional salt for enhanced security |
| `preserveDomain` | `boolean` | `false` | Keep original domain, only hash local part |
| `debug` | `boolean` | `false` | Enable detailed logging |
| `chunkSize` | `number` | `undefined` | Number of records to process per batch |
| `parallel` | `number` | `undefined` | Number of parallel processing threads |

## Examples

### Example 1: Basic Email Anonymization

```javascript
// Input: user@example.com
// Output: 5d41402abc4b2a76b9719d911017c592@8b1a9953c4611296a827abf8c47804d7.com

listener.use(anonymize({
  sheet: 'users',
  field: 'email_address'
}))
```

### Example 2: Preserve Domain

```javascript
// Input: user@company.com
// Output: 5d41402abc4b2a76b9719d911017c592@company.com

listener.use(anonymize({
  sheet: 'employees',
  field: 'work_email',
  preserveDomain: true
}))
```

### Example 3: With Salt for Enhanced Security

```javascript
// Using salt ensures consistent hashing across runs
// while making it harder to reverse-engineer

listener.use(anonymize({
  sheet: 'customers',
  field: 'email',
  salt: 'your-unique-salt-here',
  preserveDomain: true
}))
```

### Example 4: Debug Mode

```javascript
// Enable debug logging to see processing details

listener.use(anonymize({
  sheet: 'contacts',
  field: 'email',
  debug: true
}))
```

## Behavior

### Valid Email Processing
- Validates email format using regex pattern
- Generates MD5 hash of local part (with optional salt)
- Preserves or hashes domain based on `preserveDomain` option
- Updates the record with anonymized value

### Invalid Data Handling
- **Invalid emails**: Skipped silently (no error added)
- **Non-string values**: Skipped silently
- **Null/undefined**: Skipped silently
- **Processing errors**: Adds error to record with descriptive message

### Hash Generation
- **Without salt**: `MD5(localPart)@MD5(domain).com`
- **With salt**: `MD5(localPart + salt)@MD5(domain + salt).com`
- **Preserve domain**: `MD5(localPart + salt)@originalDomain`

## Security Considerations

1. **Salt Usage**: Always use a salt in production to prevent rainbow table attacks
2. **Salt Storage**: Store your salt securely and separately from the data
3. **Consistency**: Use the same salt across runs if you need consistent hashing
4. **Domain Preservation**: Consider privacy implications when preserving domains

## Performance

The plugin uses Flatfile's bulk record processing for optimal performance:
- Processes records in configurable batches
- Supports parallel processing
- Minimal memory footprint
- Efficient MD5 hashing using Node.js crypto module

## Error Handling

The plugin handles various error scenarios gracefully:

```javascript
// Errors are added to individual records, not thrown globally
record.addError('email', 'Failed to anonymize email: [error message]')
```

Common error scenarios:
- Malformed email addresses (skipped)
- Non-string field values (skipped)
- Crypto/hashing errors (error added to record)

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import { anonymize, type AnonymizeOptions } from '@flatfile/plugin-anonymize'

const options: AnonymizeOptions = {
  sheet: 'users',
  field: 'email',
  salt: 'my-salt',
  preserveDomain: true
}

listener.use(anonymize(options))
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our [GitHub repository](https://github.com/FlatFilers/flatfile-plugins).

## License

This plugin is licensed under the ISC License.
