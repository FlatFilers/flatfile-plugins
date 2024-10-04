module.exports = {
  testEnvironment: 'node',
  testRegex: '.*\\.(e2e-)?spec\\.ts$',
  // testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.e2e.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/test/dotenv-config.js'],
  setupFilesAfterEnv: [
    '<rootDir>/test/betterConsoleLog.js',
    '<rootDir>/test/unit.cleanup.js',
  ],
  testTimeout: 60_000,
  globalSetup: '<rootDir>/test/setup-global.js',
  forceExit: true,
  passWithNoTests: true,
}
