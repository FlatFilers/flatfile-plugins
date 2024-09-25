import { buildConfig } from '@flatfile/rollup-config';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const umdExternals = [
  '@flatfile/api',
  '@flatfile/hooks',
  '@flatfile/listener',
  '@flatfile/util-common',
  '@flatfile/plugin-record-hook',
  'axios'
];

const config = buildConfig({
  input: 'src/index.ts', // Adjust this to your main entry file
  includeUmd: true,
  umdConfig: { 
    name: 'FlatfileExportPlugin', // Replace with your plugin name
    external: umdExternals 
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist/types',
    }),
    resolve({
      browser: true,
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
  ],
  external: [
    ...umdExternals,
    'axios',
  ]
});

export default config;