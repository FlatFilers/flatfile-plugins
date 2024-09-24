# @flatfile/plugin-graphql-schema

## 1.3.0

### Minor Changes

- 8f376dd: This release updates several Flatfile dependencies to the latest versions.

### Patch Changes

- Updated dependencies [8f376dd]
  - @flatfile/plugin-space-configure@0.6.0

## 1.2.2

### Patch Changes

- 1dcdfea: This release fixes the bundling of plugins
- Updated dependencies [1dcdfea]
  - @flatfile/plugin-space-configure@0.5.1

## 1.2.1

### Patch Changes

- Updated dependencies [5f77620]
  - @flatfile/plugin-space-configure@0.5.0

## 1.2.0

### Minor Changes

- 9257c54: This release moves `@flatfile/api` to the plugin's `peerDependencies`. Most plugins use the `@flatfile/api` SDK, and as such, we don’t want to bundle it with every plugin. By moving `@flatfile/api` to `peerDependencies`, it won’t be bundled. However, the consuming project will be required to install it. Depending on the npm version, `peerDependencies` may be auto-installed or a warning given when `npm install` is run. Additionally, this significantly reduces the bundle size.

### Patch Changes

- Updated dependencies [9257c54]
  - @flatfile/plugin-space-configure@0.4.0

## 1.1.2

### Patch Changes

- 868df3b: This release adds the ability to create documents

## 1.1.1

### Patch Changes

- e156b41: This release fixes filtering of GraphQL objects by providing Sheet slugs

## 1.1.0

### Minor Changes

- c122112: Introducing the GraphQL to Flatfile Blueprint plugin. This plugin can be used either to generate Flatfile Blueprint from GraphQL or to configure a Flatfile Space from GraphQL. Several options are available to provide the GraphQL to the plugin. It either can be provided from a GraphQL API endpoint, a GraphQL schema file, or a custom callback function.

## 1.0.0

### Patch Changes

- 7fa7925: updating readmes
