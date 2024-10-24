import dotenv from 'dotenv'
import { defineConfig as tsupDefineConfig } from 'tsup'

dotenv.config()

export function defineConfig({ includeBrowser = true, includeNode = true }) {
  const minify = process.env.NODE_ENV === 'production'
  if (!minify) {
    console.log('Not in production mode - skipping minification')
  }

  const EXTENSION_MAP = {
    browser: {
      cjs: '.browser.cjs',
      esm: '.browser.js',
    },
    node: {
      cjs: '.cjs',
      esm: '.js',
    },
  }

  const getOutExtension =
    (platform) =>
    ({ format }) => ({
      js: EXTENSION_MAP[platform][format],
    })

  const createConfig = (platform) => ({
    name: platform,
    platform,
    minify,
    entryPoints: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist',
    clean: true,
    sourcemap: true,
    treeshake: true,
    splitting: true,
    outExtension: getOutExtension(platform),
  })

  const nodeConfig = createConfig('node')
  const browserConfig = createConfig('browser')

  const configs = []
  if (includeNode) configs.push(nodeConfig)
  if (includeBrowser) configs.push(browserConfig)

  return tsupDefineConfig(configs)
}
