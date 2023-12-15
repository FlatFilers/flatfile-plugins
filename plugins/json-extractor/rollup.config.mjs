import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

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
    plugins: [
      json(),
      commonjs({ include: '../../node_modules/**' }),
      nodeResolve({ browser: false }),
      typescript({
        tsconfig: '../../tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        exclude: ['**/tests/*', '**/*.spec.ts'],
      }),
    ],
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
    plugins: [
      json(),
      commonjs({ include: '../../node_modules/**' }),
      nodeResolve({ browser: true }),
      typescript({
        tsconfig: '../../tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        exclude: ['**/tests/*', '**/*.spec.ts'],
      }),
    ],
  },
]
