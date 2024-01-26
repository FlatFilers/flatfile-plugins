# @flatfile/plugin-constraints

This plugin introduces the ability to register external constraints for blueprint.

## Usage

```ts
listener.use(
  externalConstraint('length', (value, key, { config, record }) => {
    if (value.length > config.max) {
      record.addError(key, `Text must be under ${config.max} characters`)
      // alternatively throw the error
    }
  })
)
```

```js
// blueprint fields
[
  {
    key: 'name',
    type: 'string',
    constraints: [
      { type: 'external', validator: 'length', config: { max: 100 } }
    ]
  },
  {
    key: 'age',
    type: 'number',
  }
]
```

