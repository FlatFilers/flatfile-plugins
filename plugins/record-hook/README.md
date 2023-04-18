# Flatfile Record Hook Plugin

This plugin provides a concise syntax for running custom logic on individual data records in Flatfile.

Example usage:

```ts
client.use(
  recordHook('my-sheet', (record: FlatfileRecord) => {
    const firstName = record.get('firstName')
    const lastName = record.get('lastName')
    if (firstName && lastName && !record.get('fullName')) {
      record.set('fullName', `${firstName} ${lastName}`)
      record.addComment(
        'fullName',
        'Full name was populated from first and last name.'
      )
    }
    return record
  })
)
```
