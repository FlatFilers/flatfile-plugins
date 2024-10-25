import { defineConfig, type ViteUserConfig } from 'vitest/config'

export default defineConfig((): ViteUserConfig => {
  return {
    test: {
      globalSetup: ['../../test/setup-global.ts'],
      environment: 'node',
      testTimeout: 30000,
      globals: true,
    },
    plugins: [],
  }
})
