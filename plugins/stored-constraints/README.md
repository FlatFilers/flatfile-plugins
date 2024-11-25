<!-- START_INFOCARD -->

# @flatfile/plugin-stored-constraints

The `@flatfile/plugin-stored-constraints` plugin enables running stored constraints.

**Event Type:**
`listener.on('commit:created')`

<!-- END_INFOCARD -->

## Installation

```bash install
npm i @flatfile/plugin-stored-constraints
```

## Usage

```ts listener.ts
import type { FlatfileListener } from "@flatfile/listener";
import { storedConstraint } from '@flatfile/plugin-stored-constraints'

export default function (listener: FlatfileListener) {
  listener.use(storedConstraint())
}
```
