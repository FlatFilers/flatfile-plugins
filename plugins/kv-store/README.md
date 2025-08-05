<!-- START_INFOCARD -->

The `@flatfile/plugin-kv-store` plugin provides a JavaScript interface to interact with Flatfile's key-value storage service. It supports basic operations like `set`, `get`, and `clear`, as well as advanced array operations including `append`, `delete`, `pop`, and `shift` with unique value filtering capabilities.

**Storage Type:**
Persistent key-value storage

<!-- END_INFOCARD -->

## Parameters

The kv-store plugin has environment variables to be configured:

#### `FLATFILE_KV_URL` - `string` - **only required when running `flatfile develop`**
The URL endpoint for the Flatfile KV service.

## Usage

```bash install
npm i @flatfile/plugin-kv-store
```

### Import

```js
import { kv } from "@flatfile/plugin-kv-store";
```

The `kv` object provides methods for interacting with the key-value store.

### Basic Operations

#### Set a value

```js
await kv.set("user:123", { name: "John", email: "john@example.com" });
```

#### Get a value

```js
const user = await kv.get("user:123");
console.log(user); // { name: "John", email: "john@example.com" }
```

#### Clear a value

```js
await kv.clear("user:123");
```

### Array Operations

The plugin includes specialized methods for working with array values:

#### Append to an array

```js
// Basic append
await kv.list.append("tags", ["red", "blue"]);

// Append with unique constraint
await kv.list.append("tags", ["blue", "green"], { unique: true });
```

#### Delete from an array

```js
await kv.list.delete("tags", ["red"]);
```

#### Pop from an array

```js
const lastItem = await kv.list.pop("tags");
```

#### Shift from an array

```js
const firstItem = await kv.list.shift("tags");
```

## Example Usage

This example demonstrates how to use the kv-store plugin for managing user sessions and preferences:

### JavaScript

```js
import { kv } from "@flatfile/plugin-kv-store";

// Store user session data
await kv.set("session:abc123", {
  userId: "user_456",
  expiresAt: Date.now() + 3600000, // 1 hour
  permissions: ["read", "write"]
});

// Retrieve session data
const session = await kv.get("session:abc123");
if (session && session.expiresAt > Date.now()) {
  console.log("Valid session for user:", session.userId);
}

// Manage user preferences as arrays
await kv.list.append("user:456:preferences", ["dark-mode", "notifications"]);
await kv.list.append("user:456:preferences", ["auto-save"], { unique: true });

// Remove a preference
await kv.list.delete("user:456:preferences", ["notifications"]);

// Get the latest preference
const latestPref = await kv.list.pop("user:456:preferences");
```

### TypeScript

```ts
import { kv } from "@flatfile/plugin-kv-store";

interface UserSession {
  userId: string;
  expiresAt: number;
  permissions: string[];
}

// Store typed session data
const sessionData: UserSession = {
  userId: "user_456",
  expiresAt: Date.now() + 3600000,
  permissions: ["read", "write"]
};

await kv.set("session:abc123", sessionData);

// Retrieve and validate session
const session = await kv.get("session:abc123") as UserSession | null;
if (session && session.expiresAt > Date.now()) {
  console.log("Valid session for user:", session.userId);
}

// Manage preferences
await kv.list.append("user:456:tags", ["important", "urgent"]);
const tags = await kv.get("user:456:tags") as string[];
```

## Error Handling

The plugin provides detailed error messages for common scenarios:

- Missing environment variables
- Network connectivity issues
- Invalid JSON data
- Array operations on non-array values
- Key not found (returns `null`)
