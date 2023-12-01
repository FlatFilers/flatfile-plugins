import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'

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
  plugins: [typescript(), commonjs({ include: '../../node_modules/**' }), nodeResolve({ browser: true })],
}
