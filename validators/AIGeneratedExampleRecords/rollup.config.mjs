import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/listener',
  '@flatfile/plugin-record-hook',
  '@flatfile/util-common',
  '@anthropic-ai/sdk'
];

const config = buildConfig({
  input: 'src/index.ts', // Assuming your main file is src/index.ts
  external: [
    ...umdExternals,
    'dotenv',
    'node-fetch'
  ],
  includeBrowser: true,
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfileAIGeneratorPlugin', 
    external: umdExternals 
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types'
    }),
    resolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs(),
    json()
  ]
});

export default config;