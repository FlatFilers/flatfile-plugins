module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.e2e.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000, // Increase timeout to 30 seconds
};
