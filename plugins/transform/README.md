# Flatfile Transform Plugin

This plugin provides utilities for transforming and validating records in Flatfile.

## Methods

### compute

Transforms the value of a field based solely on the intial value of that field. Optionally pass a message to surface to the user about the transformation.

```ts
client.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    compute(
      record,
      'firstName',
      (value) => value && value.toString().toLowerCase(),
      // optional
      'First name was changed to lower case.'
    )
    return record
  })
)
```

### transform

Transforms the value of a field based on other fields in the record.

```ts
client.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    transform(
      record,
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`,
      // optional
      'Full name was computed
    )
    return record
  })
)
```

### transformIfPresent

Transforms the value of a field if specified fields are present.

```ts
client.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    transformIfPresent(
      record,
      ['firstName', 'lastName'],
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`,
      // optional
      'Full name was computed from first name and last name.'
    )
    return record
  })
)
```

### validate

Sets a field as invalid if its value does not meet a specified condition.

```ts
client.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    validate(record, 'lastName', 'Last name cannot contain numbers', (value) =>
      /\d/.test(value.toString())
    )
    return record
  })
)
```
