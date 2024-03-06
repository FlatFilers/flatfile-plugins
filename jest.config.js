const path = require('path')

module.exports = {
  verbose: true,
  preset: 'ts-jest/presets/js-with-ts-esm',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!node-fetch|fetch-blob)'],
  setupFiles: [path.join(__dirname, './testing/setup-tests.js')],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testTimeout: 30_000,
  globalSetup: './testing/setup-global.js',
}
