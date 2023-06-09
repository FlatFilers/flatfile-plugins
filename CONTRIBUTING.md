# Contribution Guide

This guide provides instructions on how to make a valuable contribution. We store all official plugins in the `./plugins` folder.

## Prerequisites

Before you begin contributing, please ensure you have the following software installed on your local development environment:

- **Typescript**: This is the main language we use for development.
- **NodeJS**: Our project relies on NodeJS for runtime execution.

If you're new to these tools, you might find the following resources helpful:

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Getting Started Guide](https://nodejs.org/en/docs/guides/getting-started-guide/)

## Setting Up Your Development Environment & Preparing for Release

Follow these steps to set up your development environment and prepare for release:

1. **Install Dependencies**: Run the command `npm install` at the root level to install all necessary project dependencies.
2. **Develop**: Make the necessary changes or additions in the relevant plugin folder.
3. **Document**: Make sure you update or write a README.md file for the plugin you're contributing to.
4**Prepare for Release**: Once you've made your changes and are ready to propose them for inclusion (a Pull Request or "PR"), create a changeset to document your updates. Run the command `npm run changeset` at the root level and select the plugin you updated.

## Development & Testing

During the development process, ensure your changes meet our standards and function as intended:

- **Develop**: Update the existing code or add new code in the relevant plugin folder.
- **Test**: Write end-to-end (e2e) tests for your plugin against the Flatfile API. A testing API key is included for this purpose.

By adhering to this guide, you'll ensure your contributions are valuable and easily integrated. Thank you for your commitment to improving our project!
