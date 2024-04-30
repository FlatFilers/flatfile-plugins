# @flatfile/plugin-webhook-event-forwarder

## 0.3.1

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins

## 0.3.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

## 0.2.3

### Patch Changes

- e9ea2d8: This release refactors and optimizes import statements across all plugins and utility files, particularly emphasizing the use of TypeScript's type keyword for type-only imports. Additionally, this release centralizes the Rollup configuration and replaces axios with cross-fetch for HTTP requests. These changes streamline the codebase, enhance type safety, and unify HTTP request handling across the project.

## 0.2.2

### Patch Changes

- cee3fa7: This release updates the @flatfile/plugin-webhook-event-forwarder plugin to use fetch instead of axios.
- c7f2d69: This release updates the `@flatfile/api` and `@flatfile/listener` dependencies

## 0.2.1

### Patch Changes

- 4a417af: Update package.json to have exports and browser

## 0.2.0

### Minor Changes

- 7c1c094: Update package.json exports

## 0.1.1

### Patch Changes

- 9aa56ac: Update axios dependency

## 0.1.0

### Minor Changes

- 30981b2: Dependency updates
