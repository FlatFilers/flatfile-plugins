# Flatfile Transform Plugin

This plugin provides utilities for transforming and validating records in Flatfile.

## Install & import

`npm i @flatfile/plugin-transform @flatfile/hooks`

```ts
import {
  compute,
  transform,
  transformIfPresent,
  validate,
} from '@flatfile/plugin-transform'
import type { FlatfileRecord } from '@flatfile/hooks'
```

## Usage

Use these transformation utilities inside a record hook to transform and validate individual record hooks. Listen for updates to data records, and respond by transforming or validating the incoming data.

### 1. Create a listener

Set up a listener to configure Flatfile and respond to data events:

<!-- TODO: Link to listener documentation here -->

```ts
import {
  Client,
  FlatfileVirtualMachine,
  FlatfileEvent,
} from '@flatfile/listener'

const listener = Client.create((client) => {
  // Set up your configuration here
})

const FlatfileVM = new FlatfileVirtualMachine()

listener.mount(FlatfileVM)

export default listener
```

### 2. Listen for record changes

Use the @flatfile/plugin-record-hook plugin to set up a hook that responds to data changes:

<!-- TODO: link to record hook plugin documentation here -->

```ts
import { recordHook } from '@flatfile/plugin-record-hook'

listener.use(recordHook('my-sheet', (record: FlatfileRecord) => {}))
```

### 3. Transform and validate data

Inside your record hook, use these transformation utilities to transform and validate incoming data:

```ts
listener.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    compute(
      record,
      'firstName',
      (value) => value && value.toString().toLowerCase(),
      'First name was changed to lower case.'
    )
    transformIfPresent(
      record,
      ['firstName', 'lastName'],
      'fullName',
      (record) => `${record.get('firstName')} ${record.get('lastName')}`,
      'Full name was generated from first name and last name.'
    )
    validate(
      record,
      'lastName',
      'Last name cannot contain numbers',
      (value) => !/\d/.test(value.toString())
    )
    return record
  })
)
```

## Methods

### compute

Computes a new value for a field based solely on the intial value of that field. Optionally pass a message to surface to the user about the transformation.

#### Syntax

```
compute(record, fieldName, transformation, message)

```

`record: FlatfileRecord` the record to transform

`fieldName: string` the name of the field to transform

`transformation: (value) => string | number | boolean | null` the transformation to perform on the field value

`message: string` (optional) a message to show on the cell after the transformation

#### Example

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

Transforms the value of a field based on other fields in the record. Differs from `compute` in that the transformation function receives the entire record.

#### Syntax

```
transform(record, fieldName, transformation, message)
```

`record: FlatfileRecord` the record to transform

`fieldName: string` the name of the field to transform

`transformation: (record) => string | number | boolean | null` the transformation to perform on the record

`message: string` (optional) a message to show on the cell after the transformation

#### Example

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

#### Syntax

```
transformIfPresent(record, presentFields, fieldName, transformation, message)
```

`record: FlatfileRecord` the record to transform

`presentFields: string[]` the names of the fields that must be present for the transformation to occur

`fieldName: string` the name of the field to transform

`transformation: (record) => string | number | boolean | null` the transformation to perform on the record

`message: string` (optional) a message to show on the cell after the transformation

#### Example

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

#### Syntax

```
validate(record, fieldName, message, validator)
```

`record: FlatfileRecord` the record to validate

`fieldName: string` the name of the field to validate

`message: string` the message to display when the field is invalid

`validator: (value) => boolean` a function that determines whether a given field value is valid

```ts
client.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    validate(
      record,
      'lastName',
      'Last name cannot contain numbers',
      (value) => !/\d/.test(value.toString())
    )
    return record
  })
)
```
