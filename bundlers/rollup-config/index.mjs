import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import terser from '@rollup/plugin-terser'
import { dts } from 'rollup-plugin-dts'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

import dotenv from 'dotenv'
dotenv.config()

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

function commonPlugins(browser, umd = false) {
  return [
    !umd && peerDepsExternal(),
    json(),
    commonjs({
      include: '**/node_modules/**',
      requireReturnsDefault: 'auto',
      esmExternals: true,
    }),
    resolve({ browser, preferBuiltins: !browser }),
    sucrase({
      include: ['src/**'],
      exclude: ['**/node_modules/**', '**/.*/', '**/*.spec.ts'],
      transforms: ['typescript'],
    }),
    PROD && terser(),
  ]
}

export function buildConfig({
  external = [],
  includeNode = false,
  includeBrowser = false,
  includeDefinition = false,
  includeUmd = true,
  umdConfig = { name: undefined, external: [] },
}) {
  if (includeUmd && !umdConfig.name) {
    throw new Error('umdConfig.name is required when includeUmd is true')
  }

  return [
    // Node.js build
    ...(includeNode
      ? [
          {
            input: 'src/index.ts',
            output: [
              {
                exports: 'auto',
                file: 'dist/index.cjs',
                format: 'cjs',
              },
              {
                exports: 'auto',
                file: 'dist/index.js',
                sourcemap: false,
                format: 'es',
              },
            ],
            plugins: commonPlugins(false),
            external,
          },
        ]
      : []),
    // Browser build
    ...(includeBrowser
      ? [
          {
            input: 'src/index.ts',
            output: [
              {
                exports: 'auto',
                file: 'dist/index.browser.cjs',
                format: 'cjs',
              },
              {
                exports: 'auto',
                file: 'dist/index.browser.js',
                sourcemap: false,
                format: 'es',
              },
            ],
            plugins: commonPlugins(true),
            external,
          },
        ]
      : []),
    // Definition file
    ...(includeDefinition
      ? [
          {
            input: 'src/index.ts',
            output: [{ file: 'dist/index.d.ts', format: 'es' }],
            plugins: [dts()],
          },
        ]
      : []),
    // UMD build
    ...(includeUmd
      ? [
          {
            input: 'src/index.ts',
            output: [
              {
                file: 'dist/index.umd.js',
                format: 'umd',
                name: umdConfig.name,
              },
            ],
            plugins: commonPlugins(true, true),
            external: umdConfig.external,
          },
        ]
      : []),
  ]
}
