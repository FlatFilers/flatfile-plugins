const path = require('path')

module.exports = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: { 'node-fetch': '<rootDir>/node_modules/node-fetch-jest' },
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
