import { buildConfig } from '@flatfile/rollup-config'
import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@faker-js/faker',
]

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  includeUmd: true,
  umdConfig: {
    name: 'FlatfileGenerateExampleRecords',
    external: umdExternals,
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    json(),
  ],
  external: [...umdExternals, 'crypto'],
})

export default config
