import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

import dotenv from 'dotenv'
dotenv.config()

const PROD = process.env.NODE_ENV !== 'development'
if (!PROD) {
  console.log('Not in production mode - skipping minification')
}

const external = ['@flatfile/listener', '@flatfile/plugin-record-hook']

function commonPlugins(browser) {
  return [
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
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]
