import dotenv from 'dotenv'
import { defineConfig as tsupDefineConfig } from 'tsup'

dotenv.config()

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const nodeConfig = {
  name: 'node',
  platform: 'node',
  minify: process.env.NODE_ENV === 'production',
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
  minify: process.env.NODE_ENV === 'production',
  entryPoints: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.browser.cjs' : '.browser.js',
  }),
}

export function defineConfig({ includeBrowser = true }) {
  return tsupDefineConfig(includeBrowser ? [nodeConfig, browserConfig] : [nodeConfig])
}
