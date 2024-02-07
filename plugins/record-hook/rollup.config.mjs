import { dts } from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

import dotenv from 'dotenv'
dotenv.config()

const PROD = process.env.NODE_ENV === 'production'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const external = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
]

function commonPlugins(browser, umd = false) {
  return [
    !umd
      ? peerDepsExternal({
          includeDependencies: true,
        })
      : undefined,
    json(),
    commonjs({ include: '**/node_modules/**', requireReturnsDefault: 'auto' }),
    resolve({ browser, preferBuiltins: !browser }),
    typescript({
      tsconfig: '../../tsconfig.json',
      declaration: false,
      declarationMap: false,
      declarationDir: './dist',
      exclude: ['**/tests/*', '**/*.spec.ts'],
    }),
    PROD ? terser() : null,
  ]
}

export default [
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
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'umd',
        name: 'PluginRecordHook',
      },
    ],
    plugins: commonPlugins(true, true),
    internal: external,
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
