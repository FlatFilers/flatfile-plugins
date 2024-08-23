# Flatfile Plugins

Library of open-source plugins for developing with the Flatfile Platform

## Available Plugins

- Column Copier: A plugin to copy data from one column to another.

To get started building plugins:

1. Run `npm i` at the root level.
2. To make a changeset, run `npm run changeset` at the root level and choose the plugin you want to update.

Additional Commands

There are more commands that you can run on every plugin at the root level. For instance, the release is run by GitHub, so you don't have to do this manually.

Each plugin has its own package.json that you can run.

1. The `npm run build` command uses what's in index.ts and builds a minified compiled version of the code using Rollup. That is what gets published to npm.

## Contributing

To contribute a new plugin or improve an existing one, please refer to the individual plugin's README for specific instructions.
