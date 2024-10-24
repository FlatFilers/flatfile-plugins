import dotenv from 'dotenv'
import { defineConfig as tsupDefineConfig } from 'tsup'

dotenv.config()

export function defineConfig({
  includeBrowser = true,
  includeNode = true,
  includeUmd = false,
  umdConfig = { name: undefined, external: [] },
}) {
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

  if (includeUmd) {
    nodeConfig.format.push('iife')
    nodeConfig.globalName = umdConfig.name
    nodeConfig.outExtension = ({ format }) => ({
      js: format === 'cjs' ? '.cjs' : format === 'iife' ? '.umd.js' : '.js',
    })
    nodeConfig.external = umdConfig.external
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

  if (includeUmd) {
    browserConfig.format.push('iife')
    browserConfig.globalName = umdConfig.name
    browserConfig.outExtension = ({ format }) => ({
      js:
        format === 'cjs'
          ? '.browser.cjs'
          : format === 'iife'
            ? '.browser.umd.js'
            : '.browser.js',
    })
    browserConfig.external = umdConfig.external
  }

  const configs = []
  if (includeNode) configs.push(nodeConfig)
  if (includeBrowser) configs.push(browserConfig)

  return tsupDefineConfig(configs)
}
