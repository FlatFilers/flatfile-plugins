import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import terser from '@rollup/plugin-terser'
import { dts } from 'rollup-plugin-dts'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

import dotenv from 'dotenv'
dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'
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
      exclude: ['node_modules/**'],
      transforms: ['typescript'],
    }),
    PROD && terser(),
  ]
}

export function buildConfig({
  external = [],
  includeBrowser = true,
  includeUmd = false,
  umdConfig = { name: undefined, external: [] },
}) {
  return [
    // Node.js build
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
          file: 'dist/index.mjs',
          sourcemap: false,
          format: 'es',
        },
      ],
      plugins: commonPlugins(false),
      external,
    },
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
                file: 'dist/index.browser.mjs',
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
    {
      input: 'src/index.ts',
      output: [{ file: 'dist/index.d.ts', format: 'es' }],
      plugins: [dts()],
    },
    // UMD build
    ...(includeUmd
      ? [
          {
            input: 'src/index.ts',
            output: [
              {
                file: 'dist/index.js',
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
