module.exports = {
  testEnvironment: 'node',

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['../../test/dotenv-config.js'],
  setupFilesAfterEnv: [
    '../../test/betterConsoleLog.js',
    '../../test/unit.cleanup.js',
  ],
  testTimeout: 60_000,
  globalSetup: '../../test/setup-global.js',
  forceExit: true,
  passWithNoTests: true,
}
