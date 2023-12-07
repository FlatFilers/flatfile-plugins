import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/main.js',
      format: 'cjs',
    },
    {
      file: 'dist/module.mjs',
      format: 'es',
    },
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'PluginRecordHook',
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
    }),
  ],
}
