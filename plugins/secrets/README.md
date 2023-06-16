# @flatfile/plugin-secrets

This package exports a function named `secrets` that sets up an event listener populated with the secrets available to the user and cached for the lifetime of the event.

`npm i @flatfile/plugin-secrets`

## Get Started

```ts
import { secrets } from '@flatfile/plugin-secrets'

export default function (listener: FlatfileListener) {
  listener.use(secrets)

  listener.use(recordHook('contacts', (record, event) => {
      const secrets = event.cache.get('secrets')
      const gtok = secrets.get('GOOGLE_MAPS_TOKEN')

    //   ... Perform logic with token
  }))
}
```