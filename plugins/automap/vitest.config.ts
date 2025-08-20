import config from '@flatfile/config-vitest'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  ...config({ mode: 'defaults' }),
  test: {
    ...config({ mode: 'defaults' }).test,
    testTimeout: 150_000,
    hookTimeout: 30_000,
  },
})
