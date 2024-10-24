import dotenv from 'dotenv'
import { defineConfig as tsupDefineConfig } from 'tsup'

dotenv.config()

export function defineConfig({ includeBrowser = true, includeNode = true }) {
  const minify = process.env.NODE_ENV === 'production'
  if (!minify) {
    console.log('Not in production mode - skipping minification')
  }

  const nodeConfig = {
    name: 'node',
    platform: 'node',
    minify,
    entryPoints: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    clean: true,
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.cjs' : '.js',
    }),
  }

  const browserConfig = {
    name: 'browser',
    platform: 'browser',
    minify,
    entryPoints: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    clean: true,
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.browser.cjs' : '.browser.js',
    }),
  }

  const configs = []
  if (includeNode) configs.push(nodeConfig)
  if (includeBrowser) configs.push(browserConfig)

  return tsupDefineConfig(configs)
}
