import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  return {
    test: {
      globalSetup: ['../../test/setup-global.ts'],
      environment: 'node',
      testTimeout: 30000,
      globals: true,
      env: {
        ...loadEnv(mode, '../../', ''),
      },
    },
    plugins: [],
  }
})
